import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiGetProfile, apiUpdateProfile, apiDeleteProfile } from '../api';
import Button from '../components/Button';

export default function ProfilePage() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username: '', displayName: '', password: '' });
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetProfile();
        setUser(data);
        setEditData({
          username: data.username || '',
          displayName: data.displayName || '',
          password: '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  async function handleDelete() {
    setDeleteError(null);
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await apiDeleteProfile();
      logout();
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiUpdateProfile({
        username: editData.username,
        displayName: editData.displayName,
        password: editData.password || undefined,
      });
      setUser(data);
      setEditMode(false);
      setEditData({ ...editData, password: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-container">
      <div className="card-surface p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-dark text-white flex items-center justify-center text-lg font-bold">{user ? (user.displayName ? user.displayName.split(' ').map(n=>n[0]).slice(0,2).join('') : (user.username||'U').slice(0,2).toUpperCase()) : 'U'}</div>
            <h1 className="text-2xl font-semibold">User Profile</h1>
          </div>
          <div>
            {!editMode && (
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => setEditMode(true)}>Edit Profile</Button>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
              </div>
            )}
          </div>
        </div>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {deleteError && <div className="text-red-600">{deleteError}</div>}

        {user && !editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <div className="space-y-3">
              <div><span className="font-medium">Username:</span> <span className="ml-2">{user.username}</span></div>
              <div><span className="font-medium">Display Name:</span> <span className="ml-2">{user.displayName}</span></div>
              <div><span className="font-medium">Email:</span> <span className="ml-2">{user.email}</span></div>
            </div>
            <div className="space-y-3">
              {user.roles && <div><span className="font-medium">Roles:</span> <span className="ml-2">{user.roles.join(', ')}</span></div>}
              <div className="text-sm text-gray-600">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
            </div>
          </div>
        )}

        {user && editMode && (
          <form className="flex flex-col gap-3 mt-2" onSubmit={handleEditSave}>
            <label className="flex flex-col text-sm">
              Username:
              <input
                className="border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent text-text"
                type="text"
                value={editData.username}
                placeholder={user.username}
                onChange={e => setEditData({ ...editData, username: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col text-sm">
              Display Name:
              <input
                className="border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent text-text"
                type="text"
                value={editData.displayName}
                placeholder={user.displayName || ''}
                onChange={e => setEditData({ ...editData, displayName: e.target.value })}
              />
            </label>
            <label className="flex flex-col text-sm">
              New Password:
              <input
                className="border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent text-text"
                type="password"
                value={editData.password}
                placeholder="Leave blank to keep current password"
                onChange={e => setEditData({ ...editData, password: e.target.value })}
              />
            </label>
            <div className="flex gap-3 mt-2">
              <Button variant="primary" type="submit">Save</Button>
              <Button variant="ghost" type="button" onClick={() => { setEditMode(false); setEditData({ ...editData, password: '' }); }}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
