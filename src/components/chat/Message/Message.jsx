import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  const formatMessage = (content) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => (
        <div key={index} className="message-paragraph">
          {paragraph.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>
              {line}
              {lineIndex < paragraph.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
      ));
  };

  const formatTimestamp = (timestamp) => {
    // Handle both Date objects and string timestamps from localStorage
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {message.type === 'user' ? (
          <div className="user-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        ) : (
          <div className="assistant-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
          </div>
        )}
      </div>
      <div className="message-content">
        <div className="message-text">
          {formatMessage(message.content)}
        </div>
        <div className="message-time">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;
