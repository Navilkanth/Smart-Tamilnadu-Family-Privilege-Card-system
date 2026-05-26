import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import PortalHeader from '../components/portal/PortalHeader'
import { loginBgImages } from '../data/heroSlides'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [error, setError] = useState('')
  const [bgIndex, setBgIndex] = useState(0)
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % loginBgImages.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password, role)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'helpdesk') navigate('/helpdesk')
      else navigate('/citizen/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PortalHeader />
      <div className="flex-1 relative flex items-center justify-center p-4">
        {loginBgImages.map((img, i) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              i === bgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-slate-900/50" />

        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-tn-green text-white flex items-center justify-center font-bold text-lg mb-3">
              TN
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('signInAccount')}</h2>
            <p className="text-sm text-gray-500 mt-1">Smart Family Privilege Card</p>
          </div>

          {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select className="input mt-1 bg-white" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="citizen">Citizen</option>
                <option value="admin">Admin</option>
                <option value="helpdesk">Helpdesk</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="portal-btn-primary w-full py-3">{t('login')}</button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Demo Mode: You can enter ANY email and password! Simply select your role above to login as Citizen, Admin, or Helpdesk.
          </p>
          <p className="mt-4 text-center text-sm">
            {t('newUser')}{' '}
            <Link to="/register" className="text-tn-green font-semibold">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
