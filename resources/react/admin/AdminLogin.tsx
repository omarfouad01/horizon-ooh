import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from './AdminAuth'

export default function AdminLogin() {
  const { login } = useAdmin()
  const navigate  = useNavigate()
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, pw)
      navigate('/admin')
    } catch (err: any) {
      const apiMsg = (err as any)?.response?.data?.message
      setError(apiMsg ?? err?.message ?? 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="w-10 h-10 flex items-center justify-center text-white font-black text-sm rounded-xl" style={{ background: '#D90429' }}>H</span>
          <div>
            <p className="font-black text-base text-gray-900 tracking-tight">HORIZON OOH</p>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
          <h1 className="text-xl font-black text-gray-900 mb-1">Sign In</h1>
          <p className="text-sm text-gray-400 mb-8">Authorized access only</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="username"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)} required
                autoComplete="current-password"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-xl text-white font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-opacity"
              style={{ background: '#0B0F1A' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          © 2026 Horizon OOH — Restricted Access
        </p>
      </div>
    </div>
  )
}
