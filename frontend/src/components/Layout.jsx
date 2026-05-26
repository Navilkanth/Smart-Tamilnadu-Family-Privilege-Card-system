import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { Languages, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children, nav = [] }) {
  const { user, logout } = useAuth()
  const { lang, toggle, t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800">
          <Link to="/" className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <img src="/gov/tn-emblem.png" alt="TN" className="h-8 w-8" />
            {t('appTitle')}
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {nav.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  active 
                    ? 'bg-tn-green text-white font-medium shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role} Account</p>
          </div>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors">
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {nav.find(n => n.to === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button type="button" onClick={toggle} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
              <Languages size={16} />
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
            <div className="h-8 w-8 rounded-full bg-tn-green flex items-center justify-center text-white font-bold shadow-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-in custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
