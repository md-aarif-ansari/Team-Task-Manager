import React, { useEffect, useMemo, useState } from 'react';
import { apiGetProfile, apiListTeamsForUser, apiListTasksByUser } from '../api';

function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date';
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  if (!task?.dueDate) return false;
  if (task?.status === 'DONE') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

function isDueSoon(task, days = 3) {
  if (!task?.dueDate) return false;
  if (task?.status === 'DONE') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const ms = due.getTime() - Date.now();
  return ms >= 0 && ms <= days * 24 * 60 * 60 * 1000;
}

function StatusPill({ status }) {
  const map = {
    TO_DO: 'bg-slate-100 text-slate-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    BLOCKED: 'bg-amber-100 text-amber-900',
    DONE: 'bg-green-100 text-green-800',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-800';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="card-surface p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);
  const [teams, setTeams] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const profile = await apiGetProfile();
        if (!mounted) return;
        setMe(profile);

        const [teamsRes, tasksRes] = await Promise.all([
          apiListTeamsForUser(profile.id),
          apiListTasksByUser(profile.id),
        ]);
        if (!mounted) return;
        setTeams(Array.isArray(teamsRes) ? teamsRes : []);
        setMyTasks(Array.isArray(tasksRes) ? tasksRes : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const byStatus = { TO_DO: 0, IN_PROGRESS: 0, BLOCKED: 0, DONE: 0 };
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    let overdue = 0;
    let dueSoon = 0;

    for (const t of myTasks) {
      if (t?.status && byStatus[t.status] !== undefined) byStatus[t.status] += 1;
      if (t?.priority && byPriority[t.priority] !== undefined) byPriority[t.priority] += 1;
      if (isOverdue(t)) overdue += 1;
      if (isDueSoon(t, 3)) dueSoon += 1;
    }

    const active = (byStatus.TO_DO || 0) + (byStatus.IN_PROGRESS || 0) + (byStatus.BLOCKED || 0);

    return {
      teamCount: teams.length,
      taskCount: myTasks.length,
      active,
      overdue,
      dueSoon,
      byStatus,
      byPriority,
    };
  }, [teams.length, myTasks]);

  const recentTasks = useMemo(() => {
    const copy = [...myTasks];
    copy.sort((a, b) => {
      const ad = a?.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b?.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
    return copy.slice(0, 6);
  }, [myTasks]);

  return (
    <div className="app-container">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-gray-600">
            {me?.displayName || me?.username ? `Welcome back, ${me.displayName || me.username}` : 'Welcome back'}
          </div>
        </div>

        {error ? (
          <div className="card-surface p-4 text-red-700 bg-red-50 border border-red-100">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="My Teams" value={loading ? '…' : stats.teamCount} hint="Teams you’re a member of" />
          <MetricCard label="My Tasks" value={loading ? '…' : stats.taskCount} hint="Tasks assigned to you" />
          <MetricCard label="Active" value={loading ? '…' : stats.active} hint="Not done yet" />
          <MetricCard label="Overdue" value={loading ? '…' : stats.overdue} hint="Past due date" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">By Status</h2>
              <div className="text-xs text-gray-500">Due soon: {loading ? '…' : stats.dueSoon}</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">To do</span>
                <span className="font-semibold">{loading ? '…' : stats.byStatus.TO_DO}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">In progress</span>
                <span className="font-semibold">{loading ? '…' : stats.byStatus.IN_PROGRESS}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">Blocked</span>
                <span className="font-semibold">{loading ? '…' : stats.byStatus.BLOCKED}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">Done</span>
                <span className="font-semibold">{loading ? '…' : stats.byStatus.DONE}</span>
              </div>
            </div>
          </div>

          <div className="card-surface p-4">
            <h2 className="text-lg font-semibold">By Priority</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">Low</span>
                <span className="font-semibold">{loading ? '…' : stats.byPriority.LOW}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">Medium</span>
                <span className="font-semibold">{loading ? '…' : stats.byPriority.MEDIUM}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm">High</span>
                <span className="font-semibold">{loading ? '…' : stats.byPriority.HIGH}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Tasks (Soonest Due)</h2>
            <div className="text-xs text-gray-500">Showing {loading ? '…' : recentTasks.length} of {loading ? '…' : myTasks.length}</div>
          </div>

          {loading ? (
            <div className="mt-3 text-sm text-gray-600">Loading…</div>
          ) : recentTasks.length === 0 ? (
            <div className="mt-3 text-sm text-gray-600">No assigned tasks yet.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {recentTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-white/60 rounded-md px-3 py-2 border border-black/5">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="text-xs text-gray-600">
                      {formatDueDate(t.dueDate)}{isOverdue(t) ? ' · Overdue' : isDueSoon(t) ? ' · Due soon' : ''}
                      {t.teamId ? ` · Team #${t.teamId}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusPill status={t.status} />
                    <span className="text-xs text-gray-600">{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
