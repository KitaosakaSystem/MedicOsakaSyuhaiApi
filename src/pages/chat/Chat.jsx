// pages/chat/Chat.jsx
import  {  useEffect, useRef, useState } from 'react';
import ChatMessage from '../../components/chat/ChatMessage';
import ActionButtons from '../../components/chat/ActionButtons';

import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';

const Chat = () => {

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('集配連絡＞最初のクリニック'))
  })

  const [messages, setMessages] = useState([
    { id: 1, text: '東京中央病院の集配予定を確認いたしました', time: '14:20', isSystem: true },
    { id: 2, text: '検体あり', time: '14:21', isUser: true },
    { id: 3, text: '承知いたしました。回収に向かいます。', time: '14:22', isSystem: true }
  ]);
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

  const handleSend = () => {
    if (!selectedAction) return;

    const messageText = {
      'collect': '検体あり',
      'no-collect': '検体なし',
      'recollect': '再集配'
    }[selectedAction];

    if (messageText) {
      const newMessage = {
        id: messages.length + 1,
        text: messageText,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      };
      setMessages([...messages, newMessage]);
      setSelectedAction(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto  bg-gray-50">

      {/* Sliceで定義したactionをdispatch経由で呼び出す */}
      <button aria-label="hello" onClick={() => dispatch(changeText('集配連絡＞うんこクリニック'))}>
          こんにちは
      </button>

      {/* メッセージ */}
      <div className="flex-1  p-4 " >
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
      </div>

      <div className="bg-white border-t p-4">
        <ActionButtons 
          selectedAction={selectedAction}
          onActionSelect={handleActionSelect}
          onSend={handleSend}
        />
      </div>

        <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;