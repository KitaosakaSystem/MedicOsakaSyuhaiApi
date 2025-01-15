// pages/chat/Chat.jsx
import  { useState } from 'react';
import ChatMessage from '../../components/chat/ChatMessage';
import ActionButtons from '../../components/chat/ActionButtons';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: '東京中央病院の集配予定を確認いたしました', time: '14:20', isSystem: true },
    { id: 2, text: '検体あり', time: '14:21', isUser: true },
    { id: 3, text: '承知いたしました。回収に向かいます。', time: '14:22', isSystem: true }
  ]);
  const [selectedAction, setSelectedAction] = useState(null);

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
    <div className="flex-1 flex flex-col">
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <div className="flex items-center">
            <button className="mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center">
                <h2 className="text-base text-teal-50">東京中央病院</h2>
                <span className="ml-2 text-sm text-teal-100">オンライン</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <ActionButtons 
        selectedAction={selectedAction}
        onActionSelect={handleActionSelect}
        onSend={handleSend}
      />
    </div>
  );
};

export default Chat;