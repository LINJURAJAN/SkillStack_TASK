import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform any logout logic here (clear tokens, user data, etc.)
    // For now, we'll just redirect to the signin page
    navigate('/signin');
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">User Profile</h1>
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="profile-info">
                <h2>LINJU</h2>
                <p className="text-muted">linjurajan@gmail.com</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">January 2023</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Skills Tracked:</span>
                <span className="detail-value">12</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Resources Completed:</span>
                <span className="detail-value">8</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Current Streak:</span>
                <span className="detail-value">5 days</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;