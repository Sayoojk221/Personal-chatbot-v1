import React, { useState } from 'react';
import ChatHistoryList from '../../components/chat/ChatHistoryList/ChatHistoryList';
import UserMenu from '../../components/chat/UserMenu/UserMenu';
import MessageList from '../../components/chat/MessageList/MessageList';
import ChatInput from '../../components/chat/ChatInput/ChatInput';
import './ChatInterfaceView.css';

const ChatInterfaceView = ({ onNavigateToProfile }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock chat history data
  const chatHistory = [
    {
      id: 1,
      title: "What is the best open source font available today for UI/UX design?",
      timestamp: "2 hours ago",
      preview: "When it comes to UI/UX design, the \"best\" open-source font depends a bit on the platform..."
    },
    {
      id: 2,
      title: "React component optimization",
      timestamp: "1 day ago",
      preview: "Here are some best practices for optimizing React components..."
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox",
      timestamp: "3 days ago",
      preview: "Both CSS Grid and Flexbox are powerful layout tools..."
    },
    {
      id: 4,
      title: "JavaScript async/await patterns",
      timestamp: "1 week ago",
      preview: "Async/await makes asynchronous code more readable..."
    }
  ];

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    // In a real app, you'd fetch messages for this chat
    if (chatId === 1) {
      setMessages([
        {
          id: 1,
          type: 'user',
          content: 'What is the best open source font available today for UI/UX design?',
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'assistant',
          content: `When it comes to UI/UX design, the "best" open-source font depends a bit on the platform, use case, and visual style you're aiming for. That said, a few fonts consistently rise to the top because of their readability, versatility, and strong community support. Let's break it down:

**1. Inter**

Why it's considered the gold standard:
• Inter was purpose-built for digital interfaces by Rasmus Andersson, so everything about it is optimized for screens. It has excellent x-height, open counters, and generous spacing, which makes text highly legible even at small sizes (great for mobile apps and dashboards).
• It also supports variable font technology, letting you fine-tune weight and optical sizing without loading multiple font files.

Best use cases: Web apps, mobile apps, dashboards, and any digital product where clarity is key.

**2. Roboto**

Why it's a strong choice:
• Originally designed for Android by Google, Roboto has become one of the most widely used open-source fonts in UI/UX. It balances geometric forms with a friendly, approachable feel. Its neutrality makes it versatile—while some criticize it for being "overused," its ubiquity is also a testament to how well it works.

Best use cases: Cross-platform products, Android apps, and design systems that require familiarity and reliability.`,
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (message) => {
    // Create new chat if none selected
    if (!selectedChat) {
      const newChatId = Date.now();
      setSelectedChat(newChatId);
    }

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'This is a simulated response. In a real application, this would be connected to your AI backend.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleProfile = () => {
    onNavigateToProfile();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Handle logout logic
  };

  return (
    <div className="chat-interface-view">
      {/* Left Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Personal Chatbot</h2>
        </div>
        
        <ChatHistoryList 
          chatHistory={chatHistory}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
        />
        
        <UserMenu 
          onProfile={handleProfile}
          onLogout={handleLogout}
        />
      </div>

      {/* Right Main Area */}
      <div className="chat-main">
        {selectedChat || messages.length > 0 ? (
          <>
            <div className="messages-container">
              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>Welcome to Personal Chatbot</h3>
                <p>Start a new conversation by typing your message below.</p>
              </div>
            </div>
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Start a new conversation..."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterfaceView;
