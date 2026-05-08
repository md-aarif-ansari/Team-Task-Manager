import React, { useState } from 'react';
import { apiLogin } from '../api';
import Button from '../components/Button'

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiLogin({ usernameOrEmail, password });
      if (onLogin && data && data.token) onLogin(data.token);
    } catch  {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="w-full max-w-md auth-card p-8">
      <h2 className="text-2xl font-semibold mb-4 text-text">Sign In</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={e => setUsernameOrEmail(e.target.value)}
          required
        />
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">Login</Button>
      </form>
      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      <div className="text-sm text-gray-600 mt-4">
        Don't have an account? <a className="text-accent" href="#" onClick={onSwitchToRegister}>Register</a>
      </div>
    </div>
  );
}
