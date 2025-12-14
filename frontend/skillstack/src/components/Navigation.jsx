import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">📚</span>
        <span className="logo-text">SkillStack</span>
      </Link>
      
      <ul className="nav-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/categories" className={location.pathname === '/categories' ? 'active' : ''}>
            Categories
          </Link>
        </li>
        <li>
          <Link to="/skills" className={location.pathname === '/skills' ? 'active' : ''}>
            Skills
          </Link>
        </li>
        <li>
          <Link to="/resources" className={location.pathname === '/resources' ? 'active' : ''}>
            Resources
          </Link>
        </li>
        <li>
          <Link to="/certifications" className={location.pathname === '/certifications' ? 'active' : ''}>
            Certifications
          </Link>
        </li>
        
        <li>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
        </li>
      </ul>
      
      <div className="user-icon">
        <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;