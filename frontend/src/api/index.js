// Central API utility for all backend calls
// Handles JWT, errors, and provides functions for all endpoints

import { clearToken, getToken } from '../auth/token'

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = 'Unknown error';
    try { msg = (await res.json()).message || res.statusText; } catch { /* ignore */ }

    // If the token is invalid/expired, ensure the app logs out consistently
    if (res.status === 401) {
      clearToken()
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Auth
export async function apiLogin({ usernameOrEmail, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password })
  });
  const body = await handleResponse(res);
  return body;
}

export async function apiRegister({ username, email, password, displayName }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, displayName })
  });
  const body = await handleResponse(res);
  return body;
}

export async function apiGetProfile() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiUpdateProfile({ username, displayName, password }) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ username, displayName, password })
  });
  return handleResponse(res);
}

export async function apiDeleteProfile() {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

// Teams
export async function apiCreateTeam(dto) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(dto)
  });
  return handleResponse(res);
}

export async function apiAddMember(teamId, userId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}`, {
    method: 'POST',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiListTeamsForUser(userId) {
  const res = await fetch(`${API_BASE}/teams?userId=${encodeURIComponent(userId)}`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiUpdateTeam(teamId, dto) {
  const res = await fetch(`${API_BASE}/teams/${teamId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(dto)
  });
  return handleResponse(res);
}

export async function apiDeleteTeam(teamId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiRemoveMember(teamId, userId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiListMembers(teamId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

// Tasks
export async function apiCreateTask(dto) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(dto)
  });
  return handleResponse(res);
}

export async function apiGetTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiListTasksByTeam(teamId) {
  const res = await fetch(`${API_BASE}/tasks/team/${teamId}`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiListTasksByUser(userId) {
  const res = await fetch(`${API_BASE}/tasks/user/${userId}`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiUpdateTask(id, dto) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(dto)
  });
  return handleResponse(res);
}

export async function apiDeleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiAssignUserToTask(taskId, userId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/assignees/${userId}`, {
    method: 'POST',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiUnassignUserFromTask(taskId, userId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/assignees/${userId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export async function apiChangeTaskStatus(taskId, status) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
}

// End of API
