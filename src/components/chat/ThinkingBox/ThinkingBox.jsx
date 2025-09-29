import React from 'react';
import './ThinkingBox.css';

const ThinkingBox = ({ thinking, isVisible, isThinking }) => {
  if (!isVisible) return null;

  return (
    <div className="thinking-box">
      <div className="thinking-header">
        <div className="thinking-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.55 0 1.09.05 1.62.14"/>
          </svg>
        </div>
        <span className="thinking-title">Model Thinking</span>
        {isThinking && (
          <div className="thinking-indicator">
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="thinking-content">
        {thinking ? (
          <div className="thinking-text">
            {thinking.split('\n').map((line, index) => (
              <p key={index} className="thinking-line">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="thinking-placeholder">
            {isThinking ? 'AI is thinking step by step...' : 'Thinking process will appear here'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingBox;
