import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('frisco_auth') === 'true';
  });

  const handleLogin = (username) => {
    localStorage.setItem('frisco_auth', 'true');
    localStorage.setItem('frisco_user', username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('frisco_auth');
    localStorage.removeItem('frisco_user');
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
