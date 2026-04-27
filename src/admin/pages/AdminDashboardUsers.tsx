import { useState, useEffect, useCallback } from 'react'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field } from '../ui'
import { Plus, Pencil, Trash2, ShieldCheck, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '@/api'
import { HAS_API } from '@/store/apiStore'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  phone?: string
  createdAt: string
  lastSeen?: string
  notes?: string
}

const ROLES: DashboardUser['role'][] = ['admin', 'editor', 'viewer']
const ROLE_COLORS: Record<DashboardUser['role'], string> = {
  admin:  'red',
  editor: 'blue',
  viewer: 'gray',
}
const ROLE_LABELS: Record<DashboardUser['role'], string> = {
  admin:  'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}
const ROLE_DESC: Record<DashboardUser['role'], string> = {
  admin:  'Full access — can edit all content and manage users',
  editor: 'Can edit content but cannot manage users or settings',
  viewer: 'Read-only access — cannot make changes',
}

// ─── LocalStorage fallback ────────────────────────────────────────────────────
const LS_KEY = 'horizon_dashboard_users'

function loadLocalUsers(): DashboardUser[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : getDefaultUsers()
  } catch { return getDefaultUsers() }
}
function saveLocalUsers(users: DashboardUser[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users))
}
function getDefaultUsers(): DashboardUser[] {
  return [{
    id: '1',
    name: 'Admin',
    email: 'admin@horizonooh.com',
    role: 'admin',
    createdAt: new Date().toISOString().slice(0, 10),
  }]
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ─── User Form ────────────────────────────────────────────────────────────────
interface UserFormProps {
  editing?: DashboardUser | null
  onClose: (didSave?: boolean) => void
}

function UserForm({ editing, onClose }: UserFormProps) {
  const isEdit = !!editing
  const [f, setF] = useState({
    name:      editing?.name  || '',
    email:     editing?.email || '',
    role:      (editing?.role || 'editor') as DashboardUser['role'],
    phone:     editing?.phone || '',
    password:  '',
    password2: '',
  })
  const [showPw, setShowPw]   = useState(false)
  const [saving, setSaving]   = useState(false)

  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim())  { toast.error('Name is required'); return }
    if (!f.email.trim()) { toast.error('Email is required'); return }
    if (!isEdit && !f.password) { toast.error('Password is required for new users'); return }
    if (f.password && f.password !== f.password2) { toast.error('Passwords do not match'); return }
    if (f.password && f.password.length < 8) { toast.error('Password must be at least 8 characters'); return }

    setSaving(true)
    try {
      if (HAS_API) {
        // ── Real API ───────────────────────────────────────────────────────
        const payload: any = {
          name:  f.name.trim(),
          email: f.email.trim(),
          role:  f.role,
          phone: f.phone.trim() || undefined,
        }
        if (f.password) payload.password = f.password

        if (isEdit && editing) {
          await usersApi.update(editing.id, payload)
          toast.success('User updated')
        } else {
          await usersApi.create(payload)
          toast.success('User created — they can now log in with these credentials')
        }
      } else {
        // ── Demo mode (localStorage) ──────────────────────────────────────
        const users = loadLocalUsers()
        if (isEdit && editing) {
          const updated = users.map(u => u.id === editing.id
            ? { ...u, name: f.name.trim(), email: f.email.trim(), role: f.role, phone: f.phone.trim() || undefined }
            : u
          )
          saveLocalUsers(updated)
          if (f.password) {
            const passwords = getPwMap()
            passwords[editing.id] = f.password
            localStorage.setItem('horizon_dashboard_passwords', JSON.stringify(passwords))
          }
          toast.success('User updated (local demo)')
        } else {
          const newUser: DashboardUser = {
            id: uid(),
            name:      f.name.trim(),
            email:     f.email.trim(),
            role:      f.role,
            phone:     f.phone.trim() || undefined,
            createdAt: new Date().toISOString().slice(0, 10),
          }
          saveLocalUsers([...users, newUser])
          const passwords = getPwMap()
          passwords[newUser.id] = f.password
          localStorage.setItem('horizon_dashboard_passwords', JSON.stringify(passwords))
          toast.success('User created (local demo)')
        }
      }
      onClose(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? (err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(', ')
            : null)
        ?? err?.message
        ?? 'Save failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *"  value={f.name}  onChange={(e: any) => set('name',  e.target.value)} required placeholder="e.g. Ahmed Hassan" />
        <Field label="Email *"      value={f.email} onChange={(e: any) => set('email', e.target.value)} required type="email" placeholder="user@horizonooh.com" />
      </div>
      <Field label="Phone (optional)" value={f.phone} onChange={(e: any) => set('phone', e.target.value)} placeholder="+20 10x xxx xxxx" />

      {/* Role selector */}
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Role *</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map(r => (
            <button
              key={r} type="button"
              onClick={() => set('role', r)}
              className={`p-3 rounded-xl text-left border-2 transition-all ${f.role === r ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`text-[12px] font-bold mb-0.5 ${f.role === r ? 'text-red-600' : 'text-gray-700'}`}>{ROLE_LABELS[r]}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{ROLE_DESC[r]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Field
            label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
            value={f.password}
            onChange={(e: any) => set('password', e.target.value)}
            type={showPw ? 'text' : 'password'}
            placeholder={isEdit ? 'Enter new password to change…' : 'Min. 8 characters'}
          />
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute right-2 top-[28px] p-1 text-gray-400 hover:text-gray-700">
            {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        </div>
        <Field
          label="Confirm Password"
          value={f.password2}
          onChange={(e: any) => set('password2', e.target.value)}
          type={showPw ? 'text' : 'password'}
          placeholder="Repeat password"
        />
      </div>

      {!HAS_API && (
        <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <strong>Demo mode:</strong> Credentials saved locally. Connect to your real Laravel server to use the live API.
        </p>
      )}

      <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={() => onClose(false)}>Cancel</Btn>
        <Btn type="submit" loading={saving}>{isEdit ? 'Save Changes' : 'Create User'}</Btn>
      </div>
    </form>
  )
}

function getPwMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('horizon_dashboard_passwords') || '{}') }
  catch { return {} }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboardUsers() {
  const [users,   setUsers]   = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(false)
  const [edit,    setEdit]    = useState<DashboardUser | null>(null)
  const [del,     setDel]     = useState<DashboardUser | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      if (HAS_API) {
        const data = await usersApi.all()
        setUsers(Array.isArray(data) ? data : [])
      } else {
        setUsers(loadLocalUsers())
      }
    } catch (err: any) {
      console.error('[AdminDashboardUsers] fetch failed', err)
      // Fallback to local on API error
      setUsers(loadLocalUsers())
      toast.error('Could not load users from server — showing local data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function openNew()  { setEdit(null); setForm(true) }
  function openEdit(u: DashboardUser) { setEdit(u); setForm(true) }

  async function handleDelete() {
    if (!del) return
    try {
      if (HAS_API) {
        await usersApi.remove(del.id)
      } else {
        const updated = loadLocalUsers().filter(u => u.id !== del.id)
        saveLocalUsers(updated)
      }
      toast.success('User removed')
      setDel(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Delete failed')
      setDel(null)
    }
  }

  function closeForm(didSave?: boolean) {
    setForm(false)
    setEdit(null)
    if (didSave) fetchUsers()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Dashboard Users"
        subtitle={loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} with dashboard access`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40">
              {loading ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
            </button>
            <Btn onClick={openNew}><Plus size={13}/>Add User</Btn>
          </div>
        }
      />

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: '#F0F4FF', border: '1px solid #D6E0FF' }}>
        <ShieldCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-blue-800">Dashboard Access Control</p>
          <p className="text-[12px] text-blue-600 mt-0.5">
            These users can log in at <code className="bg-blue-100 px-1 rounded">/admin</code>.{' '}
            {HAS_API
              ? 'Connected to live Laravel backend — changes take effect immediately.'
              : 'Demo mode — credentials stored locally. Connect to your live server for real user management.'}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin"/> Loading users…
        </div>
      ) : (
        <Tbl>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Created</Th>
              <Th className="w-24">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <div className="text-center py-8 text-gray-400 text-[13px]">No users yet — add one above</div>
                </Td>
              </Tr>
            ) : users.map(u => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                      style={{ background: '#0B0F1A' }}>
                      {(u.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </Td>
                <Td className="text-[13px] text-gray-600">{u.email}</Td>
                <Td className="text-[13px] text-gray-400">{u.phone || '—'}</Td>
                <Td>
                  {ROLE_LABELS[u.role as DashboardUser['role']] ? (
                    <Badge color={ROLE_COLORS[u.role as DashboardUser['role']]}>{ROLE_LABELS[u.role as DashboardUser['role']]}</Badge>
                  ) : (
                    <Badge color="gray">{u.role}</Badge>
                  )}
                </Td>
                <Td className="text-[12px] text-gray-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      onClick={() => openEdit(u)}><Pencil size={13}/></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete user"
                      onClick={() => setDel(u)}><Trash2 size={13}/></button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Tbl>
      )}

      {/* Role legend */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {ROLES.map(r => (
          <div key={r} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={ROLE_COLORS[r]}>{ROLE_LABELS[r]}</Badge>
            </div>
            <p className="text-[11px] text-gray-500">{ROLE_DESC[r]}</p>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {form && (
        <Modal title={edit ? `Edit — ${edit.name}` : 'Add Dashboard User'} onClose={() => closeForm(false)} wide>
          <UserForm editing={edit} onClose={closeForm} />
        </Modal>
      )}

      {/* Delete confirm */}
      <Confirm
        open={!!del}
        title="Remove User?"
        message={`Remove "${del?.name}" from dashboard access? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDel(null)}
      />
    </div>
  )
}
