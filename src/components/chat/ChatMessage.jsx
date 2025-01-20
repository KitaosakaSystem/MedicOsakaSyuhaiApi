import React from 'react';

const ChatMessage = ({ message }) => {
  const { isUser, text, time } = message;

  return (
    <div>
      <div
        className={`mb-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
      >
        <div
          className={`max-w-xs p-3 rounded-lg shadow-sm ${
            isUser
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-800'
          }`}
        >
          <p className="text-lg">{text}</p>
          {/* <p className={`text-sm mt-1 ${isUser ? 'text-teal-100' : 'text-gray-500'}`}>
            {time}
          </p> */}
        </div>
        <p className={`text-sm mt-1 text-gray-500 flex items-end `}>
          {time}
        </p>
    </div>

    </div>

  );
};

export default ChatMessage;