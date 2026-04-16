import { Link, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useAdmin } from './AdminAuth'
import { useState } from 'react'
import { LayoutDashboard, MapPin, Monitor, Briefcase, BookOpen, MessageSquare, Settings, LogOut, Menu, X, ExternalLink, Layers, Info, Truck, User, Users, Bell, Home } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '@/store/dataStore'

const NAVY = '#0B0F1A', RED = '#D90429'
const NAV = [
  { to:'/admin',             label:'Dashboard',     icon:LayoutDashboard, exact:true },
  { to:'/admin/homepage',    label:'Home Page',     icon:Home },
  { to:'/admin/locations',   label:'Locations',     icon:MapPin },
  { to:'/admin/billboards',  label:'Billboards',    icon:Monitor },
  { to:'/admin/services',    label:'Services',      icon:Briefcase },
  { to:'/admin/projects',    label:'Projects',      icon:Layers },
  { to:'/admin/blog',        label:'Blog Posts',    icon:BookOpen },
  { to:'/admin/contacts',    label:'Contacts',      icon:MessageSquare, badge: true },
  { to:'/admin/customers',   label:'Customers',     icon:User },
  { to:'/admin/users',       label:'Website Users', icon:Users },
  { to:'/admin/about',       label:'About Page',    icon:Info },
  { to:'/admin/suppliers',   label:'Suppliers',     icon:Truck },
  { to:'/admin/settings',    label:'Settings',      icon:Settings },
] as const

export default function AdminLayout() {
  const { isAuth, logout } = useAdmin()
  const { pathname } = useLocation()
  const [mobile, setMobile] = useState(false)
  const store = useStore()

  // Count unread contacts for badge
  const newContactCount = store.contacts.filter(c => c.status === 'new').length

  if (!isAuth) return <Navigate to="/admin/login" replace />

  const Sidebar = ({ isMobile = false }) => (
    <aside className="flex flex-col h-full w-60" style={{ background: NAVY }}>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: RED }}>H</span>
        <div>
          <p className="text-white font-black text-sm tracking-tight">HORIZON OOH</p>
          <p className="text-white/30 text-[9px] tracking-widest uppercase font-bold">Admin Panel</p>
        </div>
        {isMobile && <button onClick={() => setMobile(false)} className="ml-auto text-white/30 hover:text-white"><X size={16} /></button>}
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, exact, badge }: any) => {
          const active = exact ? pathname === to : pathname.startsWith(to)
          const badgeCount = badge ? newContactCount : 0
          return (
            <Link key={to} to={to} onClick={() => setMobile(false)}
              className={clsx('flex items-center gap-3 mx-2 mb-0.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                active ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5')}
              style={active ? { background: 'rgba(217,4,41,0.2)', borderLeft: `3px solid ${RED}`, paddingLeft: 13 } : {}}>
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                  style={{ background: RED }}>{badgeCount}</span>
              )}
              {active && badgeCount === 0 && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: RED }} />}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 text-[11px] font-semibold transition-colors">
          <ExternalLink size={12} />View Live Site
        </a>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-red-400 text-[12px] font-semibold transition-colors">
          <LogOut size={14} />Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f9fb' }}>
      <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>
      {mobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <Sidebar isMobile />
          <div className="flex-1 bg-black/50" onClick={() => setMobile(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 flex-shrink-0">
          <button className="lg:hidden text-gray-400" onClick={() => setMobile(true)}><Menu size={20} /></button>
          <div className="flex-1" />
          {/* Notification bell */}
          <Link to="/admin/contacts" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <Bell size={17}/>
            {newContactCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                style={{ background: RED }}>{newContactCount}</span>
            )}
          </Link>
          <a href="/#/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5">
            <ExternalLink size={11} />Live Site
          </a>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: RED }}>A</div>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}
