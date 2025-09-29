import React from 'react';
import './ChatHistoryList.css';

const ChatHistoryList = ({ chatHistory, selectedChat, onChatSelect, onChatDelete }) => {
  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      onChatDelete(chatId);
    }
  };

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
            <div className="chat-content">
              <div className="chat-title">{chat.title}</div>
              <div className="chat-preview">{chat.preview}</div>
              <div className="chat-timestamp">{chat.timestamp}</div>
            </div>
            <button
              className="chat-delete-btn"
              onClick={(e) => handleDeleteClick(e, chat.id)}
              title="Delete chat"
              aria-label="Delete chat"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryList;
