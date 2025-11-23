import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Simple hardcoded check
        if (username === 'admin' && password === 'frisco') {
            onLogin(username);
        } else {
            setError('Ungültiger Benutzername oder Passwort');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Frisco One</h1>
                    <p>Vacation Planner</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Benutzername</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Passwort</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="frisco"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-login">Anmelden</button>
                </form>

                <div className="login-footer">
                    <p>Demo Credentials: admin / frisco</p>
                </div>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
        }
        .login-card {
          background: var(--color-bg-primary);
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--color-bg-tertiary);
        }
        .login-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .login-header h1 {
          color: var(--color-primary);
          margin: 0;
          font-size: 2rem;
        }
        .login-header p {
          color: var(--color-text-secondary);
          margin: var(--space-xs) 0 0;
        }
        .form-group {
          margin-bottom: var(--space-lg);
        }
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
        .form-group input {
          width: 100%;
          padding: var(--space-md);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .btn-login {
          width: 100%;
          padding: var(--space-md);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-login:hover {
          opacity: 0.9;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
          padding: var(--space-sm);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-lg);
          text-align: center;
          font-size: 0.9rem;
        }
        .login-footer {
          margin-top: var(--space-xl);
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          opacity: 0.7;
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
