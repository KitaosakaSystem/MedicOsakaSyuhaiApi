// pages/chat/Chat.jsx
import  {  useEffect, useRef, useState } from 'react';
import ChatMessage from '../../components/chat/ChatMessage';
import ActionButtons from '../../components/chat/ActionButtons';

import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { useSelector } from 'react-redux';
import { addDoc, collection, doc, limit, limitToLast, onSnapshot, orderBy, query, setDoc, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const MAX_HOURLY_MESSAGES = 5;
const STORAGE_KEY = 'roomMessageCounts';

// Google App ScriptのURL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyeBI7suiUySIzsvBRccy_FbEnZcIVnrCCjK3vBerbSJVYC2m8McLwAcVWCLh9TIwqgJw/exec';

const Chat = () => {

  const chatCustomerId =  useSelector(state => state.chatUserData.chatCustomerId);
  const chatCustomerName =  useSelector(state => state.chatUserData.chatCustomerName);
  const chatStaffId =  useSelector(state => state.chatUserData.chatStaffId);
  const chatStaffName =  useSelector(state => state.chatUserData.chatStaffName);
  const chatRoomId =  useSelector(state => state.chatUserData.chatRoomId);
  const loginUserId = useSelector(state => state.loginUserData.loginUserId);
  const loginUserType = useSelector(state => state.loginUserData.loginUserType);

  // FCM通知の状態管理
  const [fcmLoading, setFcmLoading] = useState(false);
  const [fcmError, setFcmError] = useState('');

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("Chat CustomerId",chatCustomerId)
    console.log("ROOOOOOOOOM ID", chatRoomId);
    const chatPartnerId = loginUserType === 'customer' ? chatStaffId : chatCustomerId;
    const chatPartnerName = loginUserType === 'customer' ? chatStaffName : chatCustomerName;
    dispatch(changeText('(' + chatPartnerId + ')' + chatPartnerName))
  })

  const getDateMMdd = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return month + day;
  };

  //--------------------------------------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // messagesコレクションへの参照を作成
    const messagesRef = collection(db, 'messages');
     // 現在の日付をMMdd形式で取得
    const currentDate = getDateMMdd();
  
    // クエリの作成 // room_idが一致
    const q = query(
      messagesRef,
      where('room_id', '==', chatRoomId),
      where('date', '==', currentDate)
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

        } else if (change.type === 'modified') {
          // 更新されたドキュメントの新しいデータ
          const updatedMessage = {
            id: change.doc.id,
            ...change.doc.data()
          };

          // 既存のメッセージ配列から該当のメッセージを更新
          setMessages([]);
          setMessages(prevMessages => [...prevMessages, updatedMessage]);
        }

        if(change.doc.data().read_at !== ''){
          console.log("読んだのかい?",change.doc.data().read_at);
          let returnText;

          console.log("ACTION>",change.doc.data().selectedAction);

          const messageText = {
            'collect': 'ありがとうございます。検体の回収にむかいます。',
            'no-collect': 'かしこまりました。\nまた次回、よろしくお願いいたします。',
            'recollect': 'ありがとうございます。再回収に伺います。'
          }[change.doc.data().selectedAction];

          const newMessage = {
            id: messages.length + 1,
            text: messageText,
            time: change.doc.data().read_at,
            isCustomer: false
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      });
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    // コンポーネントのクリーンアップ時にリスナーを解除
    return () => unsubscribe();
  }, [chatRoomId]); // roomIdが変更されたときにリスナーを再設定
  //--------------------------------------------------------------------------------------------------------

  // roomMessageCount--------------------------------------------------------------------------------------------------------------------------------------------------
  const [messageCount, setMessageCount] = useState(0);
  const [remainingMessages, setRemainingMessages] = useState(MAX_HOURLY_MESSAGES);

  // 現在の時間帯のキーを取得（YYYY-MM-DD-HH形式）
  const getCurrentHourKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
  };

  // 現在の時間のカウントを取得
  const getCurrentCount = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;

    const data = JSON.parse(stored);
    const currentHourKey = getCurrentHourKey();
    return (data[chatRoomId]?.[currentHourKey] || 0);
  };

  useEffect(() => {
    const currentCount = getCurrentCount();
    setMessageCount(currentCount);
    setRemainingMessages(MAX_HOURLY_MESSAGES - currentCount);
  }, [chatRoomId]);

  const updateMessageCount = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    const currentHourKey = getCurrentHourKey();

    // 現在のルームのデータを更新
    const roomData = data[chatRoomId] || {};
    roomData[currentHourKey] = (roomData[currentHourKey] || 0) + 1;

    const updatedData = {
      ...data,
      [chatRoomId]: roomData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    const newCount = roomData[currentHourKey];
    setMessageCount(newCount);
    setRemainingMessages(MAX_HOURLY_MESSAGES - newCount);
  };
  // roomMessageCount--------------------------------------------------------------------------------------------------------------------------------------------------

  // FCM通知送信関数（エラー修正版）
  const sendFCMNotification = async (recipientId, messageText, selectedAction) => {
    setFcmLoading(true);
    setFcmError('');

    try {
      // 1. recipientIdの型チェックと文字列変換
      console.log('FCM送信対象:', {
        recipientId: recipientId,
        recipientType: typeof recipientId,
        recipientValue: recipientId
      });

      if (!recipientId) {
        throw new Error('受信者IDが指定されていません');
      }

      // 数値の場合は文字列に変換、文字列でない場合はStringで変換
      const recipientIdStr = String(recipientId);
      
      if (!recipientIdStr || recipientIdStr === 'null' || recipientIdStr === 'undefined') {
        throw new Error('有効な受信者IDが指定されていません');
      }

      // 2. 受信者のFCMトークンを取得（改良版）
      let collectionName;
      
      // IDの長さで判定（4桁なら顧客、7桁ならスタッフ）
      if (recipientIdStr.length === 4) {
        collectionName = 'customer';
      } else if (recipientIdStr.length === 7) {
        collectionName = 'staff';
      } else {
        // 長さで判定できない場合はloginUserTypeから逆算
        if (loginUserType === 'customer') {
          collectionName = 'staff'; // 顧客がログインしている場合、受信者はスタッフ
        } else {
          collectionName = 'customer'; // スタッフがログインしている場合、受信者は顧客
        }
        console.log(`IDの長さが不明(${recipientIdStr.length})なため、ログインユーザー種別から推測: ${collectionName}`);
      }

      console.log(`受信者情報: ID=${recipientIdStr}, Collection=${collectionName}`);

      const docRef = doc(db, collectionName, recipientIdStr);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`${collectionName}コレクションにユーザー(${recipientIdStr})が見つかりません`);
      }

      const userData = docSnap.data();
      const fcmToken = userData.fcmToken;
      
      if (!fcmToken) {
        console.warn(`受信者(${recipientIdStr})のFCMトークンが設定されていません`);
        setFcmError('受信者の通知設定が未完了のため、通知は送信されませんでした');
        return; // エラーにしないで警告のみ
      }

      // 3. 通知タイトルとメッセージを作成
      const senderName = loginUserType === 'customer' ? chatCustomerName : chatStaffName;
      const senderType = loginUserType === 'customer' ? '顧客' : 'スタッフ';
      
      let notificationTitle = `${senderType}からメッセージ`;
      let notificationBody = messageText;

      // アクションに応じてタイトルをカスタマイズ
      if (selectedAction === 'collect') {
        notificationTitle = '検体回収依頼';
        notificationBody = `${senderName}様から検体回収の依頼があります`;
      } else if (selectedAction === 'no-collect') {
        notificationTitle = '検体なしの連絡';
        notificationBody = `${senderName}様から検体なしとの連絡です`;
      } else if (selectedAction === 'recollect') {
        notificationTitle = '再回収依頼';
        notificationBody = `${senderName}様から再回収の依頼があります`;
      } else if (selectedAction === 'staff-replay') {
        notificationTitle = 'スタッフ確認完了';
        notificationBody = 'スタッフがメッセージを確認しました';
      }

      // 4. GASにFCM送信リクエストを送信
      const formData = new URLSearchParams();
      formData.append('action', 'sendNotification');
      formData.append('messageId', `chat-${Date.now()}`);
      formData.append('senderId', String(loginUserId || ''));
      formData.append('receiverId', recipientIdStr);
      formData.append('messageText', notificationBody);
      formData.append('customTitle', notificationTitle);
      formData.append('customBody', notificationBody);
      formData.append('targetToken', fcmToken);

      console.log('FCM通知送信中:', {
        recipient: recipientIdStr,
        collection: collectionName,
        title: notificationTitle,
        body: notificationBody,
        token: fcmToken.substring(0, 20) + '...',
        sender: loginUserId
      });

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('FCM応答の解析に失敗:', responseText);
        throw new Error(`FCM通知送信に失敗しました: ${responseText}`);
      }

      if (data.success) {
        console.log('FCM通知送信成功:', data);
        setFcmError(''); // エラーをクリア
      } else {
        throw new Error(data.error || 'FCM通知送信に失敗しました');
      }

    } catch (error) {
      console.error('FCM通知送信エラー:', error);
      setFcmError(`通知送信失敗: ${error.message}`);
      // エラーが発生してもチャット機能は継続
    } finally {
      setFcmLoading(false);
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

    //スタッフメッセージ処理------------------------------------------------------
    if (selectedAction == 'staff-replay'){
      console.log("スタッフーーーーーーーーーーメッセージ");
      setSelectedAction(null);
      if (!messages || messages.length === 0) {
        console.log('messagesが存在しないか、空です');
      }else{
        const message = messages[0];
        console.log('ID:', message.id);
        console.log('顧客フラグ:', message.isCustomer);
        console.log('スタッフ既読:', message.is_staff_read);
        console.log('既読時刻:', message.read_at);
        console.log('ルームID:', message.room_id);
        console.log('選択アクション:', message.selectedAction);
        console.log('送信者ID:', message.sender_id);
        console.log('テキスト:', message.text);
        console.log('時刻:', message.time);

        try {
          const messagesRefStaff = collection(db, 'messages');
          
          // room_idをドキュメントIDとして指定
          const messageDocStaff = doc(messagesRefStaff, message.room_id);
          
          // ドキュメントを更新
          await setDoc(messageDocStaff, {
            room_id: message.room_id,
            sender_id: message.sender_id,
            isCustomer: message.isCustomer,
            text: message.text,
            selectedAction: message.selectedAction,
            time: message.time,
            is_staff_read: true,
            read_at: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            pickup_at: '',
            date: getDateMMdd()
          });
          
          console.log('メッセージをスタッフが既読したフラグを追加しました:', chatRoomId);

          // FCM通知を送信（顧客に通知）- エラー修正版
          console.log('スタッフ既読通知送信対象:', {
            chatCustomerId: chatCustomerId,
            type: typeof chatCustomerId
          });
          
          if (chatCustomerId) {
            await sendFCMNotification(chatCustomerId, 'スタッフがメッセージを確認しました', 'staff-replay');
          } else {
            console.warn('chatCustomerIdが設定されていないため、FCM通知をスキップしました');
          }

          updateMessageCount();
        } catch (error) {
          console.error('エラーが発生しました:', error);
          throw error;
        }
      }    
      return;
    }

    //顧客メッセージ処理------------------------------------------------------

    // 現在のルームのメッセージ数をチェック
    const currentCount = getCurrentCount();
    if (currentCount >= MAX_HOURLY_MESSAGES) {
      alert('この時間帯のメッセージ送信上限に達しました。次の時間にお試しください。');
      return;
    }

    const messageText = {
      'collect': '〇検体あり',
      'no-collect': 'X検体なし',
      'recollect': '▼再集配'
    }[selectedAction];

    if (messageText) {
      setSelectedAction(null);
    }

    try {
      const messagesRef = collection(db, 'messages');
      
      // room_idをドキュメントIDとして指定
      const messageDoc = doc(messagesRef, chatRoomId);
      
      // ドキュメントを作成/更新
      await setDoc(messageDoc, {
        room_id: chatRoomId,
        sender_id: loginUserId,
        isCustomer: loginUserType === 'customer',
        text: messageText,
        selectedAction: selectedAction,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        is_staff_read: false,
        read_at: '',
        pickup_at: '',
        date: getDateMMdd()
      });
      
      console.log('メッセージを追加しました:', chatRoomId);

      // FCM通知を送信（相手に通知）- エラー修正版
      const recipientId = loginUserType === 'customer' ? chatStaffId : chatCustomerId;
      console.log('顧客メッセージ通知送信対象:', {
        recipientId: recipientId,
        type: typeof recipientId,
        loginUserType: loginUserType
      });
      
      if (recipientId) {
        await sendFCMNotification(recipientId, messageText, selectedAction);
      } else {
        console.warn('受信者IDが設定されていないため、FCM通知をスキップしました');
      }

      updateMessageCount();
    } catch (error) {
      console.error('エラーが発生しました:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-gray-50">

      {/* メッセージ */}
      <div className="flex-1 p-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* FCM送信状態の表示 */}
      {fcmLoading && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm">
          📱 通知送信中...
        </div>
      )}

      {fcmError && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm">
          ❌ {fcmError}
        </div>
      )}

      <div className="text-sm text-gray-600 px-4">
        残り送信可能回数: {remainingMessages} / {MAX_HOURLY_MESSAGES}
      </div>

      {chatCustomerId && (
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