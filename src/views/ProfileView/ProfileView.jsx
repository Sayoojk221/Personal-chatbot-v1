import React from 'react';
import Button from '../../components/common/Button/Button';
import './ProfileView.css';

const ProfileView = ({ onNavigateToChat }) => {
  return (
    <div className="profile-view">
      <div className="profile-container">
        <div className="profile-header">
          <Button 
            variant="ghost" 
            onClick={onNavigateToChat}
            className="back-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Chat
          </Button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1>User Profile</h1>
            <p className="profile-subtitle">Manage your account settings and preferences</p>
          </div>

          <div className="profile-sections">
            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="profile-field">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" placeholder="your.email@example.com" />
              </div>
            </div>

            <div className="profile-section">
              <h3>Preferences</h3>
              <div className="profile-field">
                <label>Theme</label>
                <select>
                  <option value="auto">Auto (System)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="profile-field">
                <label>Language</label>
                <select>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <div className="profile-section">
              <h3>Chat Settings</h3>
              <div className="profile-field checkbox-field">
                <input type="checkbox" id="save-history" />
                <label htmlFor="save-history">Save chat history</label>
              </div>
              <div className="profile-field checkbox-field">
                <input type="checkbox" id="notifications" />
                <label htmlFor="notifications">Enable notifications</label>
              </div>
            </div>

            <div className="profile-actions">
              <Button variant="primary">Save Changes</Button>
              <Button variant="secondary">Reset to Defaults</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
