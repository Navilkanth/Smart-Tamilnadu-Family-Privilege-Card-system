import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import { Search, LogIn, Languages } from 'lucide-react'

export default function PortalHeader({ onSearch }) {
  const { user } = useAuth()
  const { lang, toggle, t } = useLang()
  const dashLink = user?.role === 'admin' ? '/admin' : user?.role === 'helpdesk' ? '/helpdesk' : '/citizen/dashboard'

  return (
    <header className="bg-white border-b-2 border-tn-green/20 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/gov/tn-emblem.png" alt="TN" className="h-11 w-11" />
          <div className="leading-tight border-l-2 border-tn-gold pl-3">
            <span className="font-bold text-tn-green text-base md:text-lg block leading-snug">
              {lang === 'ta' ? 'ஸ்மார்ட் குடும்ப சிறப்பு அட்டை' : 'Smart Family Privilege Card'}
            </span>
            <span className="text-[10px] text-tn-maroon font-semibold uppercase tracking-wide">
              {lang === 'ta' ? 'தமிழ்நாடு அரசு' : 'Govt. of Tamil Nadu'}
            </span>
          </div>
        </Link>

        <div className="flex-1 min-w-[180px] max-w-lg mx-auto order-3 md:order-none w-full md:w-auto">
          <div className="relative">
            <input
              type="search"
              className="w-full pl-4 pr-11 py-2.5 rounded-md border border-gray-300 focus:border-tn-green focus:ring-1 focus:ring-tn-green outline-none text-sm bg-gray-50"
              placeholder={lang === 'ta' ? 'நலத்திட்டம் தேடு...' : 'Search welfare schemes...'}
              onChange={(e) => onSearch?.(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <nav className="flex items-center gap-2 ml-auto order-2 md:order-none">
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            <Languages size={16} />
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          {user ? (
            <Link to={dashLink} className="gov-btn-primary text-sm py-2 px-5 rounded-md">
              {t('dashboard')}
            </Link>
          ) : (
            <Link to="/login" className="gov-btn-primary flex items-center gap-2 text-sm py-2 px-5 rounded-md">
              {t('login')} <LogIn size={16} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
