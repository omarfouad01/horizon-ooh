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
      await login(email, pw)   // async — awaits API or demo fallback
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message ?? 'Invalid credentials. Please try again.')
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
          <p className="text-sm text-gray-400 mb-8">Admin access only</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="username"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)} required
                autoComplete="current-password"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"
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

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Email</span>
                <code className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border">
                  admin@horizonooh.com
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Password</span>
                <code className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border">
                  admin123
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
