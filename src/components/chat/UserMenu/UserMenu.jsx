import React, { useState } from 'react';
import Avatar from '../../common/Avatar/Avatar';
import './UserMenu.css';

const UserMenu = ({ onProfile, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleProfile = () => {
    onProfile();
    setShowMenu(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowMenu(false);
  };

  return (
    <div className="user-menu">
      <div className="user-menu-container">
        <Avatar onClick={toggleMenu} />
        
        {showMenu && (
          <div className="user-dropdown">
            <button className="dropdown-item" onClick={handleProfile}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
            <button className="dropdown-item" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
