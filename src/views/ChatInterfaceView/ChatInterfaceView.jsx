import React, { useState, useEffect } from "react";
import ChatHistoryList from "../../components/chat/ChatHistoryList/ChatHistoryList";
import UserMenu from "../../components/chat/UserMenu/UserMenu";
import MessageList from "../../components/chat/MessageList/MessageList";
import ChatInput from "../../components/chat/ChatInput/ChatInput";
import ThinkingBox from "../../components/chat/ThinkingBox/ThinkingBox";
import { useLLM } from "../../hooks/useLLM";
import { useChatPersistence } from "../../hooks/useChatPersistence";
import "./ChatInterfaceView.css";

const ChatInterfaceView = ({ onNavigateToProfile }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentThinking, setCurrentThinking] = useState("");
  const [showThinking, setShowThinking] = useState(false);

  // Utility function to clean any remaining thinking tags from content
  const cleanContentForMainChat = (content) => {
    if (!content) {
      return '';
    }
    
    
    // Remove any thinking tags and their content
    const cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<\/?think>/g, '')
      .replace(/<\/?answer>/g, '')
      .trim();
    
    return cleaned;
  };

  // Utility function to clean thinking content for display in thinking box
  const cleanThinkingContent = (content) => {
    if (!content) return '';
    
    // Remove XML-style tags commonly used in thinking processes
    let cleaned = content
      // Remove specific thinking-related tags
      .replace(/<\/?think>/gi, '')
      .replace(/<\/?think>/gi, '')
      .replace(/<\/?reason>/gi, '')
      .replace(/<\/?reasoning>/gi, '')
      .replace(/<\/?analyze>/gi, '')
      .replace(/<\/?analysis>/gi, '')
      .replace(/<\/?consider>/gi, '')
      .replace(/<\/?step>/gi, '')
      .replace(/<\/?process>/gi, '')
      .replace(/<\/?logic>/gi, '')
      .replace(/<\/?conclusion>/gi, '')
      .replace(/<\/?evaluation>/gi, '')
      .replace(/<\/?evaluate>/gi, '')
      .replace(/<\/?plan>/gi, '')
      .replace(/<\/?planning>/gi, '')
      .replace(/<\/?approach>/gi, '')
      .replace(/<\/?strategy>/gi, '')
      // Remove any remaining XML-like tags (generic cleanup)
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  // Initialize LLM hook
  const {
    isInitialized,
    isLoading,
    error: llmError,
    currentModel,
    connectionStatus,
    sendMessageStream,
    clearError,
  } = useLLM();

  // Initialize chat persistence hook
  const {
    isLoaded: isStorageLoaded,
    storageError,
    loadChatHistory,
    saveChatHistory,
    loadChatMessages,
    saveChatMessages,
    updateSetting,
    loadSettings,
    deleteChatFromHistory,
  } = useChatPersistence();

  // Load data from localStorage on component mount
  useEffect(() => {
    if (isStorageLoaded) {
      // Load chat history
      const savedChatHistory = loadChatHistory();
      setChatHistory(savedChatHistory);

      // Load settings to restore selected chat
      const settings = loadSettings();
      if (settings.selectedChatId) {
        setSelectedChat(settings.selectedChatId);
        // Load messages for the selected chat
        const savedMessages = loadChatMessages(settings.selectedChatId);
        setMessages(savedMessages);
      }
    }
  }, [isStorageLoaded, loadChatHistory, loadSettings, loadChatMessages]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (isStorageLoaded && chatHistory.length > 0) {
      saveChatHistory(chatHistory);
    }
  }, [chatHistory, isStorageLoaded, saveChatHistory]);

  // Save messages whenever they change
  useEffect(() => {
    if (isStorageLoaded && selectedChat && messages.length > 0) {
      saveChatMessages(selectedChat, messages);
    }
  }, [messages, selectedChat, isStorageLoaded, saveChatMessages]);

  // Save selected chat whenever it changes
  useEffect(() => {
    if (isStorageLoaded) {
      updateSetting('selectedChatId', selectedChat);
    }
  }, [selectedChat, isStorageLoaded, updateSetting]);

  const handleChatSelect = (chatId) => {
    // Save current chat messages before switching
    if (selectedChat && messages.length > 0) {
      saveChatMessages(selectedChat, messages);
    }

    // Switch to new chat
    setSelectedChat(chatId);
    
    // Load messages for the selected chat
    const chatMessages = loadChatMessages(chatId);
    setMessages(chatMessages);
  };

  const handleSendMessage = async (message) => {
    if (!isInitialized) {
      console.error("LLM service not initialized");
      return;
    }

    // Clear any previous errors and thinking
    clearError();
    setCurrentThinking("");
    setShowThinking(true);

    // Create new chat if none selected
    let currentChatId = selectedChat;
    if (!selectedChat) {
      currentChatId = Date.now();
      setSelectedChat(currentChatId);
      
      // Create new chat entry in history
      const newChat = {
        id: currentChatId,
        title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        timestamp: "Just now",
        preview: "New conversation...",
        createdAt: new Date().toISOString()
      };
      
      // Add to chat history
      setChatHistory(prev => [newChat, ...prev]);
    }

    const newUserMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Create assistant message placeholder
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      type: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Prepare conversation history for the LLM
      // Only include clean answer content (no thinking tags) in conversation history
      const conversationHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content, // This should already be clean answer content
      }));

      // Send message with streaming response
      await sendMessageStream(
        conversationHistory,
        (chunk, fullContent, thinking, answer) => {

          // Update thinking box with cleaned thinking content (no XML tags)
          if (thinking) {
            const cleanThinking = cleanThinkingContent(thinking);
            setCurrentThinking(cleanThinking);
          }

          // Update message with ONLY the answer part (never the full content or thinking tags)
          const cleanAnswer = cleanContentForMainChat(answer);
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: cleanAnswer }
                : msg
            )
          );
        }
      );

      // Hide thinking box after response is complete
      setTimeout(() => {
        setShowThinking(false);
        setCurrentThinking("");
      }, 2000);

      // Update chat history with response preview
      const chatToUpdate = chatHistory.find(chat => chat.id === currentChatId);
      if (chatToUpdate) {
        const updatedChat = {
          ...chatToUpdate,
          timestamp: "Just now",
          preview: "AI response received",
          lastMessageAt: new Date().toISOString()
        };
        
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === currentChatId ? updatedChat : chat
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Hide thinking box on error
      setShowThinking(false);
      setCurrentThinking("");

      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${error.message}. Please make sure Ollama is running and the Qwen3 model is available.`,
                isError: true,
              }
            : msg
        )
      );
    }
  };

  const handleProfile = () => {
    onNavigateToProfile();
  };

  const handleLogout = () => {
    // Handle logout logic
  };

  const handleNewChat = () => {
    // Save current chat messages if there are any
    if (selectedChat && messages.length > 0) {
      saveChatMessages(selectedChat, messages);
    }
    
    // Clear current chat selection and messages
    setSelectedChat(null);
    setMessages([]);
    
    // Clear any thinking state
    setCurrentThinking("");
    setShowThinking(false);
    
    // Clear any errors
    clearError();
  };

  const handleChatDelete = (chatId) => {
    // Delete from storage
    const success = deleteChatFromHistory(chatId);
    
    if (success) {
      // Update local state
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was selected, clear the selection
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setMessages([]);
        setCurrentThinking("");
        setShowThinking(false);
        clearError();
      }
    }
  };

  return (
    <div className="chat-interface-view">
      {/* Thinking Box */}
      <ThinkingBox
        thinking={currentThinking}
        isVisible={showThinking}
        isThinking={isLoading}
      />

      {/* Left Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="header-top">
            <h2>Personal Chatbot</h2>
            <button 
              className="new-chat-btn" 
              onClick={handleNewChat}
              title="Start New Chat"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
          {/* Connection Status Indicator */}
          <div className={`connection-status ${connectionStatus}`}>
            <div className="status-indicator"></div>
            <span className="status-text">
              {connectionStatus === "connected" &&
                `${currentModel} (Connected)`}
              {connectionStatus === "connecting" && "Connecting..."}
              {connectionStatus === "error" && "Connection Error"}
              {connectionStatus === "disconnected" && "Disconnected"}
            </span>
          </div>
          {llmError && (
            <div className="error-message">
              <small>{llmError}</small>
            </div>
          )}
          {storageError && (
            <div className="error-message">
              <small>Storage Error: {storageError}</small>
            </div>
          )}
        </div>

        {!isStorageLoaded ? (
          <div className="loading-state">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <span>Loading chat history...</span>
            </div>
          </div>
        ) : (
          <ChatHistoryList
            chatHistory={chatHistory}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            onChatDelete={handleChatDelete}
          />
        )}

        <UserMenu onProfile={handleProfile} onLogout={handleLogout} />
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
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
