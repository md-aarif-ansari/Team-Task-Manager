import React, { useState } from 'react';
import { apiRegister } from '../api';
import Button from '../components/Button'

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await apiRegister(form);
      setSuccess(true);
      if (onRegister) onRegister();
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md auth-card p-8">
      <h2 className="text-2xl font-semibold mb-4 text-text">Create Account</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
          name="displayName"
          placeholder="Display Name"
          value={form.displayName}
          onChange={handleChange}
          required
        />
        <Button variant="primary" type="submit">Register</Button>
      </form>
      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      {success && <div className="text-sm text-green-600 mt-3">Registration successful! You can now log in.</div>}
      <div className="text-sm text-gray-600 mt-4">
        Already have an account? <a className="text-accent" href="#" onClick={onSwitchToLogin}>Login</a>
      </div>
    </div>
  );
}
