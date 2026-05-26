import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'

const emptyMember = () => ({
  name: '', age: '', gender: 'male', occupation: '', income: 0,
  education_status: '', disability_status: false, farmer_status: false,
  widow_status: false, senior_citizen_status: false, aadhaar: '', is_head: false,
})

const DOC_CODES = ['aadhaar', 'ration_card', 'income_certificate', 'address_proof', 'community_certificate']

export default function FamilyRegistration() {
  const { t } = useLang()
  const nav = useCitizenNav()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('regSession') || '')
  const [family, setFamily] = useState({
    family_head_name: '', address: '', district: '', pincode: '', contact_number: '', email: '',
  })
  const [members, setMembers] = useState([{ ...emptyMember(), is_head: true }])
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sessionToken) {
      api.get(`/family/registration-session/${sessionToken}`)
        .then((r) => {
          const fd = r.data.form_data || {}
          if (fd.family) setFamily(fd.family)
          if (fd.members) setMembers(fd.members)
          if (fd.documents) setDocuments(fd.documents)
          setStep(r.data.current_step || 1)
        })
        .catch(() => {})
    }
  }, [sessionToken])

  const saveSession = async (nextStep) => {
    const { data } = await api.post('/family/registration-session', {
      session_token: sessionToken || undefined,
      current_step: nextStep,
      form_data: { family, members, documents },
    })
    setSessionToken(data.session_token)
    localStorage.setItem('regSession', data.session_token)
  }

  const updateMember = (i, field, value) => {
    const next = [...members]
    next[i] = { ...next[i], [field]: value }
    setMembers(next)
  }

  const addMember = () => setMembers([...members, emptyMember()])

  const toggleDoc = (code) => {
    if (documents.find((d) => d.document_code === code)) {
      setDocuments(documents.filter((d) => d.document_code !== code))
    } else {
      setDocuments([...documents, { document_code: code, file_name: `${code}.pdf`, verification_status: 'pending' }])
    }
  }

  const submit = async () => {
    setError('')
    setSaving(true)
    try {
      await api.post('/family/register', {
        ...family,
        members: members.map((m) => ({ ...m, age: parseInt(m.age, 10) || 0, income: parseFloat(m.income) || 0 })),
        documents,
      })
      localStorage.removeItem('regSession')
      navigate('/citizen/dashboard')
    } catch (e) {
      if (e.response?.status === 409) {
        localStorage.removeItem('regSession')
        navigate('/citizen/dashboard')
      } else {
        setError(e.response?.data?.error || 'Registration failed')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout nav={nav}>
      <h1 className="font-display text-3xl text-tn-green font-bold mb-6">{t('familyRegister')}</h1>
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded ${step >= s ? 'bg-tn-green' : 'bg-gray-200'}`} />
        ))}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {step === 1 && (
        <div className="card space-y-4 max-w-2xl">
          <h2 className="font-semibold text-lg">Family Details</h2>
          {['family_head_name', 'address', 'pincode', 'contact_number', 'email'].map((f) => (
            <input key={f} className="input" placeholder={f.replace(/_/g, ' ')}
              value={family[f] || ''} onChange={(e) => setFamily({ ...family, [f]: e.target.value })} />
          ))}
          <select className="input bg-white" value={family.district || ''} onChange={(e) => setFamily({ ...family, district: e.target.value })}>
            <option value="">Select District</option>
            {["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => saveSession(1)}>{t('saveProgress')}</button>
            <button type="button" className="btn-primary" onClick={async () => { await saveSession(2); setStep(2) }}>{t('next')}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {members.map((m, i) => (
            <div key={i} className="card grid md:grid-cols-2 gap-3">
              <input className="input" placeholder="Name" value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} />
              <input className="input" type="number" placeholder="Age" value={m.age} onChange={(e) => updateMember(i, 'age', e.target.value)} />
              <select className="input" value={m.gender} onChange={(e) => updateMember(i, 'gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input className="input" placeholder="Occupation" value={m.occupation} onChange={(e) => updateMember(i, 'occupation', e.target.value)} />
              <input className="input" type="number" placeholder="Income" value={m.income} onChange={(e) => updateMember(i, 'income', e.target.value)} />
              <input className="input" placeholder="Education" value={m.education_status} onChange={(e) => updateMember(i, 'education_status', e.target.value)} />
              <input className="input" placeholder="Aadhaar (last 4 ok for demo)" value={m.aadhaar} onChange={(e) => updateMember(i, 'aadhaar', e.target.value)} />
              {['disability_status', 'farmer_status', 'widow_status', 'senior_citizen_status'].map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={m[f]} onChange={(e) => updateMember(i, f, e.target.checked)} />
                  {f.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addMember}>+ Add Member</button>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>{t('back')}</button>
            <button type="button" className="btn-secondary" onClick={() => saveSession(2)}>{t('saveProgress')}</button>
            <button type="button" className="btn-primary" onClick={async () => { await saveSession(3); setStep(3) }}>{t('next')}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card max-w-2xl">
          <h2 className="font-semibold mb-4">Upload Documents (mark as submitted)</h2>
          <div className="space-y-2 mb-6">
            {DOC_CODES.map((code) => (
              <label key={code} className="flex items-center gap-2">
                <input type="checkbox" checked={!!documents.find((d) => d.document_code === code)} onChange={() => toggleDoc(code)} />
                {code.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>{t('back')}</button>
            <button type="button" className="btn-primary" onClick={submit} disabled={saving}>{t('submit')}</button>
          </div>
        </div>
      )}
    </Layout>
  )
}
