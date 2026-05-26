import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import PublicLayout from '../layouts/PublicLayout'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const { lang, t } = useLang()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register({ ...form, preferred_language: lang })
      navigate('/citizen/documents')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-tn-green mb-2">{t('register')}</h2>
        <p className="text-sm text-gray-600 mb-6">{t('registerSubtext')}</p>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="portal-btn-primary w-full">{t('register')}</button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-tn-green font-semibold">{t('login')}</Link>
        </p>
      </div>
    </PublicLayout>
  )
}
