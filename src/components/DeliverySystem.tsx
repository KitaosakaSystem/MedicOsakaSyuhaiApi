import React, { useState } from 'react';
import { Users, Route, MessageCircle, Settings, ChevronUp, ChevronDown, Check, X, RotateCcw, Send } from 'lucide-react';

const DeliveryApp = () => {
  // States remain the same...
  const [currentPage, setCurrentPage] = useState('chat');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: '東京中央病院の集配予定を確認いたしました', time: '14:20', isSystem: true },
    { id: 2, text: '検体あり', time: '14:21', isUser: true },
    { id: 3, text: '承知いたしました。回収に向かいます。', time: '14:22', isSystem: true }
  ]);
  const [selectedAction, setSelectedAction] = useState(null);

  // Handler functions remain the same...
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

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

  // Page components
  const CustomerListPage = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <h1 className="text-lg font-medium text-white">顧客一覧</h1>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">施設一覧</h2>
          {['東京中央病院', '横浜総合病院', '千葉メディカルセンター'].map((facility, index) => (
            <div key={index} className="border-b py-3 last:border-0">
              <p className="font-medium">{facility}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CourseListPage = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <h1 className="text-lg font-medium text-white">コース担当一覧</h1>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">担当コース</h2>
          {['東京エリアA', '東京エリアB', '横浜エリア'].map((course, index) => (
            <div key={index} className="border-b py-3 last:border-0">
              <p className="font-medium">{course}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <h1 className="text-lg font-medium text-white">設定</h1>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">アプリ設定</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span>通知</span>
              <button className="bg-teal-500 text-white px-4 py-1 rounded">ON</button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>テーマ</span>
              <button className="bg-gray-200 px-4 py-1 rounded">ライト</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const ChatPage = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <div className="flex items-center">
            <button className="mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">メディック集配連絡システム</h1>
              <div className="flex items-center">
                <h2 className="text-base text-teal-50">東京中央病院</h2>
                <span className="ml-2 text-sm text-teal-100">オンライン</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.isUser ? 'flex justify-end' : 'flex justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg shadow-sm ${
                message.isUser
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.isUser ? 'text-teal-100' : 'text-gray-500'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'customers':
        return <CustomerListPage />;
      case 'chat':
        return <ChatPage />;
      case 'course':
        return <CourseListPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* App Container */}
      <div className="w-full md:max-w-md lg:max-w-lg h-screen md:h-[800px] md:my-8 bg-sky-50 flex flex-col md:rounded-lg md:shadow-lg">
        {renderPage()}

        {/* Chat Actions - Only shown on chat page */}
        {currentPage === 'chat' && (
          <div className="bg-white border-t border-teal-100 p-4">
            <div className="flex justify-between items-center space-x-4">
              <button
                onClick={() => handleActionSelect('collect')}
                className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${
                  selectedAction === 'collect' ? 'bg-teal-100' : 'hover:bg-teal-50'
                }`}
              >
                <Check size={32} className="text-teal-600" />
                <span className="text-xs mt-1 text-teal-600">検体あり</span>
              </button>
              <button
                onClick={() => handleActionSelect('no-collect')}
                className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${
                  selectedAction === 'no-collect' ? 'bg-teal-100' : 'hover:bg-teal-50'
                }`}
              >
                <X size={32} className="text-teal-600" />
                <span className="text-xs mt-1 text-teal-600">検体なし</span>
              </button>
              <button
                onClick={() => handleActionSelect('recollect')}
                className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${
                  selectedAction === 'recollect' ? 'bg-teal-100' : 'hover:bg-teal-50'
                }`}
              >
                <RotateCcw size={32} className="text-teal-600" />
                <span className="text-xs mt-1 text-teal-600">再集配</span>
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedAction}
                className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${
                  !selectedAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-50'
                }`}
              >
                <Send size={20} className="text-teal-600" />
                <span className="text-xs mt-1 text-teal-600">送信</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={toggleNav}
          className="w-full bg-white p-2 border-t border-teal-100 flex justify-center items-center space-x-2 hover:bg-teal-50 transition-colors"
        >
          <span className="text-sm text-teal-700">メニュー</span>
          {isNavVisible ? 
            <ChevronDown size={20} className="text-teal-700" /> : 
            <ChevronUp size={20} className="text-teal-700" />
          }
        </button>

        {/* Bottom Navigation */}
        {isNavVisible && (
          <div className="bg-white border-t border-teal-100 md:rounded-b-lg">
            <div className="grid grid-cols-4 py-2">
              <button 
                onClick={() => setCurrentPage('customers')}
                className="flex flex-col items-center justify-center space-y-1 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              >
                <Users size={24} className={currentPage === 'customers' ? "text-teal-600" : "text-gray-500"} />
                <span className={`text-xs ${currentPage === 'customers' ? "text-teal-600" : "text-gray-500"}`}>
                  顧客一覧
                </span>
              </button>
              <button 
                onClick={() => setCurrentPage('chat')}
                className="flex flex-col items-center justify-center space-y-1 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              >
                <MessageCircle size={24} className={currentPage === 'chat' ? "text-teal-600" : "text-gray-500"} />
                <span className={`text-xs ${currentPage === 'chat' ? "text-teal-600" : "text-gray-500"}`}>
                  チャット
                </span>
              </button>
              <button 
                onClick={() => setCurrentPage('course')}
                className="flex flex-col items-center justify-center space-y-1 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              >
                <Route size={24} className={currentPage === 'course' ? "text-teal-600" : "text-gray-500"} />
                <span className={`text-xs ${currentPage === 'course' ? "text-teal-600" : "text-gray-500"}`}>
                  コース担当
                </span>
              </button>
              <button 
                onClick={() => setCurrentPage('settings')}
                className="flex flex-col items-center justify-center space-y-1 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              >
                <Settings size={24} className={currentPage === 'settings' ? "text-teal-600" : "text-gray-500"} />
                <span className={`text-xs ${currentPage === 'settings' ? "text-teal-600" : "text-gray-500"}`}>
                  設定
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryApp;