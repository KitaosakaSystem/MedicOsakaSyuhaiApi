// pages/chat/Chat.jsx
import  {  useEffect, useRef, useState } from 'react';
import ChatMessage from '../../components/chat/ChatMessage';
import ActionButtons from '../../components/chat/ActionButtons';

import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { useSelector } from 'react-redux';
import { addDoc, collection, doc, limit, limitToLast, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';

const MAX_DAILY_MESSAGES = 50;
const STORAGE_KEY = 'messageCount';

const Chat = () => {

  const chatCustomerId =  useSelector(state => state.chatUserData.chatCustomerId);
  const chatCustomerName =  useSelector(state => state.chatUserData.chatCustomerName);
  const chatRoomId =  useSelector(state => state.chatUserData.chatRoomId);
  const loginUserId = useSelector(state => state.loginUserData.loginUserId);
  const loginUserType = useSelector(state => state.loginUserData.loginUserType);

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("Chat CustomerId",chatCustomerId)
    console.log("ROOOOOOOOOM ID", chatRoomId);
    dispatch(changeText('(' + chatCustomerId + ')' + chatCustomerName))
  })

  const [messageCount, setMessageCount] = useState(0);
  const [remainingMessages, setRemainingMessages] = useState(MAX_DAILY_MESSAGES);

  // const [messages, setMessages] = useState([
  //   { id: 1, text: '集配予定を確認いたします', time: '14:20', isCustomer: false },
  //   { id: 2, text: '検体あり', time: '14:21', isCustomer: true },
  //   { id: 3, text: '承知いたしました。回収に向かいます。', time: '14:22', isCustomer: false }
  // ]);

  //--------------------------------------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // messagesコレクションへの参照を作成
    const messagesRef = collection(db, 'messages');
    
    // クエリの作成
    // room_idが一致し、送信時刻でソート
    const q = query(
      messagesRef,
      where('room_id', '==', chatRoomId),
      orderBy('time', 'asc'),
      limitToLast(20)
    );

    // リアルタイムリスナーの設定
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 変更があったドキュメントのみを処理
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // 新しく追加されたメッセージのデータ
          const newMessage = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          // stateを更新（新しいメッセージを配列の末尾に追加）
          setMessages(prevMessages => [...prevMessages, newMessage]);
          console.log('メッセージ追加イベント',change.doc.id)
        }
      });
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    //console.log("メッセージ", messages);
    // コンポーネントのクリーンアップ時にリスナーを解除
    return () => unsubscribe();
  }, [chatRoomId]); // roomIdが変更されたときにリスナーを再設定
  //--------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const loadMessageCounts = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { date, counts } = JSON.parse(stored);
        const storedDate = new Date(date).toDateString();
        const today = new Date().toDateString();

        // 日付が変わっていれば、全ルームのカウントをリセット
        if (storedDate !== today) {
          const newStorage = {
            date: new Date().toISOString(),
            counts: {}
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newStorage));
          setMessageCount(0);
          setRemainingMessages(MAX_DAILY_MESSAGES);
        } else {
          // 現在のルームのカウントを設定
          const currentRoomCount = counts[chatRoomId] || 0;
          setMessageCount(currentRoomCount);
          setRemainingMessages(MAX_DAILY_MESSAGES - currentRoomCount);
        }
      } else {
        // 初期データの作成
        const initialStorage = {
          date: new Date().toISOString(),
          counts: {}
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStorage));
      }
    };

    loadMessageCounts();
  }, [chatRoomId]);

  const updateMessageCount = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const newCounts = {
        ...data.counts,
        [chatRoomId]: (data.counts[chatRoomId] || 0) + 1
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: data.date,
        counts: newCounts
      }));

      setMessageCount(newCounts[chatRoomId]);
      setRemainingMessages(MAX_DAILY_MESSAGES - newCounts[chatRoomId]);
    }
  };

  const [selectedAction, setSelectedAction] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionSelect = (action) => {
    setSelectedAction(action === selectedAction ? null : action);
  };

  const handleSend = async () => {
    if (!selectedAction) return;

    // 現在のルームのメッセージ数をチェック
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : { counts: {} };
    const currentCount = data.counts[chatRoomId] || 0;

    if (currentCount >= MAX_DAILY_MESSAGES) {
      alert('このルームの本日のメッセージ送信上限に達しました。明日また送信できます。');
      return;
    }

    const messageText = {
      'collect': '〇検体あり',
      'no-collect': 'X検体なし',
      'recollect': '▼再集配'
    }[selectedAction];

    if (messageText) {
      // const newMessage = {
      //   id: messages.length + 1,
      //   text: messageText,
      //   time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      //   isUser: true
      // };
      // setMessages([...messages, newMessage]);
      setSelectedAction(null);
    }

    try {
      const messagesRef = collection(db, 'messages');
      
      // room_idをドキュメントIDとして指定 > メッセージは固定やし、ドキュメント１個でいいんじゃね？FireStoreの読み込み回数の節約も考慮して
      const messageDoc = doc(messagesRef, chatRoomId);
      // まずドキュメントをサーバータイムスタンプで追加
      const docRef = await setDoc(messageDoc, {
        room_id: chatRoomId,
        sender_id: loginUserId,
        isCustomer: loginUserType === 'customer', // loginUserTypeが'customer'の場合、trueを設定,
        text: messageText,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        is_read: false,
        read_at: '',
      });
      console.log('メッセージを追加しました:', chatRoomId);

      updateMessageCount();
      //return docRef.id;
    } catch (error) {
      console.error('エラーが発生しました:', error);
      throw error;
    }


  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto  bg-gray-50">

      {/* メッセージ */}
      <div className="flex-1  p-4 " >
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
      </div>

      <div className="text-sm text-gray-600">
        残りメッセージ送信可能回数: {remainingMessages} / {MAX_DAILY_MESSAGES}
      </div>

      {chatCustomerId &&(
        <div className="bg-white border-t p-4">
          <ActionButtons 
            selectedAction={selectedAction}
            onActionSelect={handleActionSelect}
            onSend={handleSend}
          />
        </div>
      )} 
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;