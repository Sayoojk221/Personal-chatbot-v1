import React from 'react';
import './ChatHistoryList.css';

const ChatHistoryList = ({ chatHistory, selectedChat, onChatSelect }) => {
  return (
    <div className="chat-history-list">
      <div className="chat-history-header">
        <span>Recent Chats</span>
      </div>
      <div className="chat-list">
        {chatHistory.map((chat) => (
          <div 
            key={chat.id}
            className={`chat-item ${selectedChat === chat.id ? 'selected' : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="chat-title">{chat.title}</div>
            <div className="chat-preview">{chat.preview}</div>
            <div className="chat-timestamp">{chat.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryList;
