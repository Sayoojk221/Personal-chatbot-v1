import React, { useState } from 'react';
import ChatInterfaceView from './views/ChatInterfaceView/ChatInterfaceView';
import ProfileView from './views/ProfileView/ProfileView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'profile'

  const navigateToProfile = () => {
    setCurrentView('profile');
  };

  const navigateToChat = () => {
    setCurrentView('chat');
  };

  return (
    <>
      {currentView === 'chat' && (
        <ChatInterfaceView onNavigateToProfile={navigateToProfile} />
      )}
      {currentView === 'profile' && (
        <ProfileView onNavigateToChat={navigateToChat} />
      )}
    </>
  );
}

export default App
