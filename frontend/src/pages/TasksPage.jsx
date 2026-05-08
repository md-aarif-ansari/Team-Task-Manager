import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  apiAssignUserToTask,
  apiChangeTaskStatus,
  apiCreateTask,
  apiDeleteTask,
  apiGetProfile,
  apiListMembers,
  apiListTasksByTeam,
  apiListTasksByUser,
  apiListTeamsForUser,
  apiUnassignUserFromTask,
  apiUpdateTask,
} from '../api'
import Card from '../components/Card'
import Button from '../components/Button'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', teamId: '', priority: 'MEDIUM' })
  const [teams, setTeams] = useState([])
  const [me, setMe] = useState(null)
  const [teamFilter, setTeamFilter] = useState('')

  const [teamMembers, setTeamMembers] = useState([])
  const [teamMembersLoading, setTeamMembersLoading] = useState(false)
  const [teamMembersError, setTeamMembersError] = useState(null)

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'MEDIUM' })
  const [savingTaskId, setSavingTaskId] = useState(null)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [mutatingTaskId, setMutatingTaskId] = useState(null)
  const [assignPickByTaskId, setAssignPickByTaskId] = useState({})

  const STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE', 'BLOCKED']
  const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

  function displayUser(u) {
    return u?.displayName || u?.username || u?.email || (u?.id != null ? `User #${u.id}` : 'User')
  }

  function updateTaskInList(updated) {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  function showToast(type, message) {
    setToast({ type, message })
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  function statusBadgeClass(status) {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function priorityBadgeClass(priority) {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'LOW':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200'
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const profile = await apiGetProfile()
        if (mounted) setMe(profile)
        const teamList = await apiListTeamsForUser(profile.id).catch(() => [])
        setTeams(teamList || [])

        const initialTeamId = searchParams.get('teamId') || ''
        if (mounted) setTeamFilter(initialTeamId)

        if (mounted && initialTeamId && !form.teamId) {
          setForm(f => ({ ...f, teamId: initialTeamId }))
        }

        // prefer listing tasks assigned to user; fallback to tasks in first team
        let list = []
        if (initialTeamId) {
          list = await apiListTasksByTeam(parseInt(initialTeamId, 10))
          try {
            setTeamMembersLoading(true)
            setTeamMembersError(null)
            const members = await apiListMembers(parseInt(initialTeamId, 10))
            setTeamMembers(members || [])
          } catch (err) {
            setTeamMembers([])
            setTeamMembersError(err.message || 'Failed to load team members')
          } finally {
            setTeamMembersLoading(false)
          }
        } else {
          try { list = await apiListTasksByUser(profile.id) } catch { /* ignore */ }
          if ((!list || list.length === 0) && teamList && teamList.length > 0) {
            list = await apiListTasksByTeam(teamList[0].id)
          }
        }
        if (mounted) setTasks(list || [])
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load tasks')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function reloadTasks(nextTeamFilter) {
    if (!me?.id) return
    setLoading(true)
    setError(null)
    try {
      const filterVal = nextTeamFilter ?? teamFilter
      let list = []
      if (filterVal) {
        const teamId = parseInt(filterVal, 10)
        list = await apiListTasksByTeam(teamId)
        setTeamMembersLoading(true)
        setTeamMembersError(null)
        try {
          const members = await apiListMembers(teamId)
          setTeamMembers(members || [])
        } catch (err) {
          setTeamMembers([])
          setTeamMembersError(err.message || 'Failed to load team members')
        } finally {
          setTeamMembersLoading(false)
        }
      } else {
        list = await apiListTasksByUser(me.id)
        setTeamMembers([])
        setTeamMembersError(null)
      }
      setTasks(list || [])
    } catch (err) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tasks-container app-container">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={[
              'rounded-md shadow-lg border px-4 py-3 text-sm',
              toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="text-sm text-gray-600">Create, assign, and track work</div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter</label>
          <select
            value={teamFilter}
            onChange={async (e) => {
              const value = e.target.value
              setTeamFilter(value)
              if (value) setSearchParams({ teamId: value })
              else setSearchParams({})
              if (value && !form.teamId) setForm(f => ({ ...f, teamId: value }))
              await reloadTasks(value)
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">My tasks</option>
            {teams.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="font-semibold">Create task</div>
          {teamFilter ? <div className="text-xs text-gray-500">Posting into team view</div> : <div className="text-xs text-gray-500">Creates a personal task by default</div>}
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            setCreating(true); setError(null);
            try {
              const dto = { title: form.title, description: form.description, teamId: form.teamId ? parseInt(form.teamId) : undefined, priority: form.priority, assigneeIds: [] };
              const profile = me || await apiGetProfile();
              if (!dto.assigneeIds || dto.assigneeIds.length === 0) dto.assigneeIds = [profile.id];
              await apiCreateTask(dto);
              showToast('success', 'Task created')
              setForm({ title: '', description: '', teamId: teamFilter || form.teamId || '', priority: 'MEDIUM' });
              // reload tasks for current view
              if (teamFilter) {
                const updated = await apiListTasksByTeam(parseInt(teamFilter, 10))
                setTasks(updated || [])
              } else {
                const updated = await apiListTasksByUser(profile.id)
                setTasks(updated || [])
              }
            } catch (err) { setError(err.message || 'Failed to create task') }
            setCreating(false);
          }}
        >
          <div className="md:col-span-3">
            <label className="text-sm text-gray-600" htmlFor="task-create-title">Title</label>
            <input
              id="task-create-title"
              placeholder="e.g. Prepare sprint demo"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
              required
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-sm text-gray-600" htmlFor="task-create-description">Description</label>
            <input
              id="task-create-description"
              placeholder="Optional"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-sm text-gray-600" htmlFor="task-create-team">Team</label>
            <select
              id="task-create-team"
              value={form.teamId}
              onChange={e => setForm({ ...form, teamId: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="">Unassigned</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-gray-600" htmlFor="task-create-priority">Priority</label>
            <select
              id="task-create-priority"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 flex md:justify-end">
            <Button type="submit" variant="primary" className="w-full">{creating ? 'Creating…' : 'Create'}</Button>
          </div>
        </form>
      </Card>

      {teamFilter && (
        <div className="text-sm text-gray-600 mb-3">
          Team view • Assignees visible below
          {teamMembersLoading ? <span className="ml-2 text-gray-500">(loading members…)</span> : null}
          {teamMembersError ? <span className="ml-2 text-red-600">({teamMembersError})</span> : null}
        </div>
      )}
      {loading && <div className="text-sm text-gray-500">Loading tasks…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.length === 0 && <div className="text-gray-600">No tasks found.</div>}
          {tasks.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingTaskId === t.id ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        placeholder="Description"
                      />
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm(f => ({ ...f, priority: e.target.value }))}
                          className="border rounded px-2 py-1"
                        >
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <Button
                          variant="primary"
                          disabled={savingTaskId === t.id}
                          onClick={async () => {
                            setSavingTaskId(t.id)
                            setError(null)
                            try {
                              const updated = await apiUpdateTask(t.id, {
                                title: editForm.title,
                                description: editForm.description,
                                priority: editForm.priority,
                              })
                              updateTaskInList(updated)
                              setEditingTaskId(null)
                            } catch (err) {
                              setError(err.message || 'Failed to update task')
                            } finally {
                              setSavingTaskId(null)
                            }
                          }}
                        >
                          {savingTaskId === t.id ? 'Saving…' : 'Save'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingTaskId(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-lg truncate">{t.title}</div>
                      <div className="text-gray-600 mt-2">{t.description}</div>
                      <div className="text-sm text-gray-500 mt-3 flex flex-wrap gap-x-3 gap-y-1 items-center">
                        <span>Status:</span>
                        <span className={['inline-flex items-center border rounded-full px-2 py-0.5 text-xs font-medium', statusBadgeClass(t.status || 'TO_DO')].join(' ')}>
                          {(t.status || 'TO_DO').replaceAll('_', ' ')}
                        </span>
                        <select
                          value={t.status || 'TO_DO'}
                          disabled={mutatingTaskId === t.id}
                          onChange={async (e) => {
                            const next = e.target.value
                            setMutatingTaskId(t.id)
                            setError(null)
                            try {
                              const updated = await apiChangeTaskStatus(t.id, next)
                              updateTaskInList(updated)
                              showToast('success', 'Status updated')
                            } catch (err) {
                              setError(err.message || 'Failed to change status')
                            } finally {
                              setMutatingTaskId(null)
                            }
                          }}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="ml-1">Priority:</span>
                        <span className={['inline-flex items-center border rounded-full px-2 py-0.5 text-xs font-medium', priorityBadgeClass(t.priority || 'MEDIUM')].join(' ')}>
                          {(t.priority || 'MEDIUM')}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Assignees</div>
                        <div className="flex flex-wrap gap-2">
                          {(t.assignees || []).length === 0 && <span className="text-sm text-gray-600">Unassigned</span>}
                          {(t.assignees || []).map(u => (
                            <span key={u.id} className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm bg-gray-50">
                              <span className="truncate max-w-[14rem]">{displayUser(u)}</span>
                              <button
                                className="text-gray-400 hover:text-gray-700"
                                disabled={mutatingTaskId === t.id}
                                title="Unassign"
                                aria-label={`Unassign ${displayUser(u)}`}
                                onClick={async () => {
                                  setMutatingTaskId(t.id)
                                  setError(null)
                                  try {
                                    const updated = await apiUnassignUserFromTask(t.id, u.id)
                                    updateTaskInList(updated)
                                    showToast('success', 'User unassigned')
                                  } catch (err) {
                                    setError(err.message || 'Failed to unassign user')
                                  } finally {
                                    setMutatingTaskId(null)
                                  }
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {teamFilter && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">Assign someone</div>
                          <select
                            value={assignPickByTaskId[t.id] || ''}
                            disabled={teamMembersLoading || mutatingTaskId === t.id}
                            onChange={async (e) => {
                              const userId = e.target.value
                              setAssignPickByTaskId(prev => ({ ...prev, [t.id]: userId }))
                              if (!userId) return

                              setMutatingTaskId(t.id)
                              setError(null)
                              try {
                                const updated = await apiAssignUserToTask(t.id, parseInt(userId, 10))
                                updateTaskInList(updated)
                                setAssignPickByTaskId(prev => ({ ...prev, [t.id]: '' }))
                                showToast('success', 'User assigned')
                              } catch (err) {
                                setError(err.message || 'Failed to assign user')
                              } finally {
                                setMutatingTaskId(null)
                              }
                            }}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select member…</option>
                            {teamMembers.map(m => (
                              <option key={m.id} value={String(m.id)}>
                                {displayUser(m)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {editingTaskId !== t.id && (
                    <>
                      <Button
                        variant="ghost"
                        className="whitespace-nowrap"
                        onClick={() => {
                          setEditingTaskId(t.id)
                              showToast('success', 'Task updated')
                          setEditForm({
                            title: t.title || '',
                            description: t.description || '',
                            priority: t.priority || 'MEDIUM',
                          })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="whitespace-nowrap"
                        disabled={deletingTaskId === t.id}
                        onClick={async () => {
                          if (!window.confirm('Delete this task?')) return
                          setDeletingTaskId(t.id)
                          setError(null)
                          try {
                            await apiDeleteTask(t.id)
                            setTasks(prev => prev.filter(x => x.id !== t.id))
                            showToast('success', 'Task deleted')
                          } catch (err) {
                            setError(err.message || 'Failed to delete task')
                          } finally {
                            setDeletingTaskId(null)
                          }
                        }}
                      >
                        {deletingTaskId === t.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

