import { useState, useCallback, useEffect } from 'react'
import { usersApi } from '@/api'
import { HAS_API } from '@/store/dataStore'
import { Btn, PageHeader, Modal } from '../ui'
import { Trash2, Search, Users, Mail, Phone, RefreshCw, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WebsiteUser {
  id: number | string
  name: string
  email: string
  phone?: string
  company?: string
  source?: string
  role?: string
  created_at?: string
  updated_at?: string
  notes?: string
}

// ─── Source badge ──────────────────────────────────────────────────────────────
const SOURCE_BADGE: Record<string, { label: string; bg: string }> = {
  website:  { label: 'Sign Up',  bg: 'bg-green-50 text-green-700 border-green-200 border' },
  signup:   { label: 'Sign Up',  bg: 'bg-green-50 text-green-700 border-green-200 border' },
  login:    { label: 'Login',    bg: 'bg-blue-50 text-blue-700 border-blue-200 border' },
  contact:  { label: 'Contact',  bg: 'bg-yellow-50 text-yellow-700 border-yellow-200 border' },
}

const defaultBadge = { label: 'User', bg: 'bg-gray-50 text-gray-600 border-gray-200 border' }

// ─── Demo data (preview mode) ─────────────────────────────────────────────────
const DEMO_USERS: WebsiteUser[] = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+20 100 123 4567', company: 'Horizon Media', source: 'website', created_at: new Date().toISOString() },
  { id: 2, name: 'Sara Mohamed', email: 'sara@example.com', phone: '+20 112 987 6543', company: 'OOH Egypt', source: 'website', created_at: new Date().toISOString() },
]

// ─── Main component ─────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users,   setUsers]   = useState<WebsiteUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [view,    setView]    = useState<WebsiteUser | null>(null)
  const [delId,   setDelId]   = useState<number | string | null>(null)
  const [notes,   setNotes]   = useState<Record<string | number, string>>({})

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      if (HAS_API) {
        const res = await usersApi.allWebsiteUsers()
        const data = res.data
        const arr  = Array.isArray(data) ? data : (data?.data ?? [])
        setUsers(arr)
      } else {
        setUsers(DEMO_USERS)
      }
    } catch (err: any) {
      console.error('[AdminUsers] fetch failed', err)
      toast.error('Could not load website users — check server connection')
      setUsers(HAS_API ? [] : DEMO_USERS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Delete user
  async function handleDelete(u: WebsiteUser) {
    if (delId !== u.id) { setDelId(u.id); return }
    try {
      if (HAS_API) {
        await usersApi.remove(u.id)
      } else {
        setUsers(prev => prev.filter(x => x.id !== u.id))
      }
      toast.success('User removed')
      setDelId(null)
      if (HAS_API) fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Delete failed')
      setDelId(null)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.company?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Website Users"
        subtitle={loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} registered via the website`}
        action={
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        }
      />

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <ShieldCheck size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-green-800">Website Sign-ups</p>
          <p className="text-[12px] text-green-700 mt-0.5">
            {HAS_API
              ? 'Users who signed up via the website are listed here in real-time from the database.'
              : 'Preview mode — connect to your live server to see real sign-ups.'}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 bg-white"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-gray-300" />
          </div>
          <p className="text-[15px] font-semibold text-gray-400">
            {users.length === 0 ? 'No sign-ups yet' : 'No results'}
          </p>
          <p className="text-[13px] text-gray-300 mt-1">
            {users.length === 0
              ? 'Users appear here as soon as they sign up on the website.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => {
            const badge = SOURCE_BADGE[u.source ?? ''] ?? defaultBadge
            const joinedDate = u.created_at
              ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
              : '—'

            return (
              <div
                key={u.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 group cursor-pointer hover:border-gray-200 transition-colors shadow-sm"
                style={{ boxShadow: '0 1px 4px rgba(11,15,26,0.06)' }}
                onClick={() => setView(u)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[14px] font-bold text-gray-500">
                        {(u.name || u.email || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{u.name || 'Anonymous'}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-lg mt-0.5 ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div
                    className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleDelete(u)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        delId === u.id
                          ? 'bg-red-500 text-white'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="flex flex-col gap-1.5">
                  {u.email && (
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Mail size={11} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  )}
                  {u.phone && (
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Phone size={11} className="text-gray-400 flex-shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                  {u.company && (
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <span className="text-gray-400 flex-shrink-0 text-[10px] font-bold">🏢</span>
                      <span className="truncate">{u.company}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-2">
                  <span className="text-[10px] text-gray-400">Joined {joinedDate}</span>
                  {u.role && <span className="text-[10px] text-gray-400 capitalize">{u.role}</span>}
                </div>

                {delId === u.id && (
                  <p className="text-[11px] text-red-500 font-semibold bg-red-50 rounded-lg px-3 py-2">
                    Click 🗑 again to confirm deletion
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!view} onClose={() => { setView(null); setDelId(null) }} title="User Details" size="md">
        {view && (
          <div className="space-y-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-[20px] font-bold text-gray-500">
                  {(view.name || view.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[16px] font-bold text-gray-900">{view.name || 'Anonymous'}</p>
                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-lg mt-1 ${(SOURCE_BADGE[view.source ?? ''] ?? defaultBadge).bg}`}>
                  {(SOURCE_BADGE[view.source ?? ''] ?? defaultBadge).label}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${view.email}`} className="text-[13px] text-blue-600 hover:underline break-all">
                  {view.email}
                </a>
              </div>
              {view.phone && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <a href={`tel:${view.phone}`} className="text-[13px] text-green-600 hover:underline">
                    {view.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Company */}
            {(view as any).company && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-[13px] text-gray-700">{(view as any).company}</p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-[12px] text-gray-500">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registered</p>
                {view.created_at ? new Date(view.created_at).toLocaleString('en-GB') : '—'}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source</p>
                <span className="capitalize">{view.source || 'website'}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-700 outline-none focus:border-gray-400 resize-none"
                rows={3}
                value={notes[view.id] ?? view.notes ?? ''}
                onChange={e => {
                  setNotes(prev => ({ ...prev, [view.id]: e.target.value }))
                }}
                placeholder="Add internal notes about this user…"
              />
              <p className="text-[11px] text-gray-400 mt-1">Notes are stored locally for now.</p>
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => handleDelete(view)}
                className={`flex items-center gap-2 text-[12px] font-semibold px-3 py-2 rounded-lg transition-colors ${
                  delId === view.id ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={13} />
                {delId === view.id ? 'Click again to confirm delete' : 'Delete user'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
