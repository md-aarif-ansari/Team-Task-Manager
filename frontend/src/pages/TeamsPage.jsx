import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  apiAddMember,
  apiCreateTeam,
  apiGetProfile,
  apiListMembers,
  apiListTeamsForUser,
  apiRemoveMember,
} from '../api'
import Card from '../components/Card'
import Button from '../components/Button'

export default function TeamsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [me, setMe] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [createError, setCreateError] = useState(null)

  const [manageOpen, setManageOpen] = useState(false)
  const [manageTeam, setManageTeam] = useState(null)
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState(null)
  const [members, setMembers] = useState([])
  const [addUserId, setAddUserId] = useState('')
  const [memberActionLoading, setMemberActionLoading] = useState(false)

  const teamById = useMemo(() => {
    const map = new Map()
    for (const t of teams) map.set(t.id, t)
    return map
  }, [teams])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const profile = await apiGetProfile()
        if (mounted) setMe(profile)
        const list = await apiListTeamsForUser(profile.id)
        if (mounted) setTeams(list || [])
      } catch (err) {
        if (mounted) setLoadError(err.message || 'Failed to load teams')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function openManage(teamId) {
    const t = teamById.get(teamId)
    if (!t) return
    setManageTeam(t)
    setManageOpen(true)
    setMembersError(null)
    setMembersLoading(true)
    try {
      const list = await apiListMembers(teamId)
      setMembers(list || [])
    } catch (err) {
      setMembersError(err.message || 'Failed to load members')
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  function closeManage() {
    setManageOpen(false)
    setManageTeam(null)
    setMembers([])
    setMembersError(null)
    setAddUserId('')
    setMemberActionLoading(false)
  }

  async function refreshTeams() {
    if (!me?.id) return
    const list = await apiListTeamsForUser(me.id)
    setTeams(list || [])
  }

  return (
    <div className="app-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <div className="text-sm text-gray-600">Create and manage teams</div>
        </div>
        <div className="hidden md:block">
          <Button variant="primary" onClick={() => setCreating(c => !c)}>{creating ? 'Close' : 'New Team'}</Button>
        </div>
      </div>

      {/* Create form (inline on small screens, card on desktop) */}
      {creating && (
        <div className="mb-4">
          <Card className="p-4">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" onSubmit={async (e) => {
              e.preventDefault();
              setCreateError(null);
              try {
                await apiCreateTeam(form);
                setForm({ name: '', description: '' });
                const profile = await apiGetProfile();
                setMe(profile)
                const list = await apiListTeamsForUser(profile.id);
                setTeams(list || []);
              } catch (err) { setCreateError(err.message || 'Failed to create team'); }
            }}>
              <div className="md:col-span-1">
                <label className="text-sm" htmlFor="team-create-name">Name</label>
                <input id="team-create-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text" />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm" htmlFor="team-create-description">Description</label>
                <input id="team-create-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text" />
              </div>
              <div className="md:col-span-1 flex gap-2">
                <Button variant="primary" type="submit">Create</Button>
                <Button variant="ghost" onClick={() => { setCreating(false); setForm({ name: '', description: '' }); }}>Cancel</Button>
              </div>
            </form>
            {createError && <div className="text-sm text-red-600 mt-2">{createError}</div>}
          </Card>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading teams…</div>}
      {loadError && <div className="text-sm text-red-600">{loadError}</div>}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 && <div className="text-gray-600">No teams yet.</div>}
          {teams.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">{t.name}</div>
                  <div className="text-gray-600 mt-2">{t.description}</div>
                  <div className="text-sm text-gray-500 mt-3">Members: {t.members ? t.members.length : 0}</div>
                  {t.admin?.id && me?.id && (
                    <div className="text-xs text-gray-500 mt-1">
                      Admin: {t.admin.id === me.id ? 'You' : (t.admin.displayName || t.admin.username)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="ghost"
                    className="whitespace-nowrap"
                    onClick={() => navigate(`/tasks?teamId=${t.id}`)}
                  >
                    View Tasks
                  </Button>
                  <Button
                    variant="ghost"
                    className="whitespace-nowrap"
                    onClick={() => openManage(t.id)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {manageOpen && manageTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeManage}>
          <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Manage Members</div>
                <div className="text-sm text-gray-600">{manageTeam.name}</div>
              </div>
              <button className="text-gray-500 hover:text-gray-800" onClick={closeManage} aria-label="Close">✕</button>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Current members</div>
              {membersLoading && <div className="text-sm text-gray-500">Loading members…</div>}
              {membersError && <div className="text-sm text-red-600">{membersError}</div>}
              {!membersLoading && !membersError && (
                <div className="space-y-2">
                  {members.length === 0 && <div className="text-sm text-gray-600">No members found.</div>}
                  {members.map((u) => (
                    <div key={u.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {u.displayName || u.username}
                          {manageTeam.admin?.id === u.id ? <span className="text-xs text-gray-500"> {' '}(admin)</span> : null}
                        </div>
                        <div className="text-xs text-gray-500 truncate">id: {u.id}{u.email ? ` • ${u.email}` : ''}</div>
                      </div>
                      <Button
                        variant="ghost"
                        className="whitespace-nowrap"
                        disabled={memberActionLoading || manageTeam.admin?.id === u.id}
                        onClick={async () => {
                          if (!window.confirm(`Remove ${u.username} from this team?`)) return
                          setMemberActionLoading(true)
                          setMembersError(null)
                          try {
                            await apiRemoveMember(manageTeam.id, u.id)
                            const list = await apiListMembers(manageTeam.id)
                            setMembers(list || [])
                            await refreshTeams()
                          } catch (err) {
                            setMembersError(err.message || 'Failed to remove member')
                          } finally {
                            setMemberActionLoading(false)
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium mb-2">Add member by User ID</div>
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const userId = parseInt(addUserId, 10)
                  if (!Number.isFinite(userId)) {
                    setMembersError('Enter a valid numeric user id')
                    return
                  }
                  setMemberActionLoading(true)
                  setMembersError(null)
                  try {
                    await apiAddMember(manageTeam.id, userId)
                    const list = await apiListMembers(manageTeam.id)
                    setMembers(list || [])
                    setAddUserId('')
                    await refreshTeams()
                  } catch (err) {
                    setMembersError(err.message || 'Failed to add member')
                  } finally {
                    setMemberActionLoading(false)
                  }
                }}
              >
                <input
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text"
                  placeholder="e.g. 12"
                />
                <Button variant="primary" type="submit" disabled={memberActionLoading}>
                  Add
                </Button>
              </form>
              <div className="text-xs text-gray-500 mt-2">Tip: you can grab user ids from seeded users or other team member lists.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}