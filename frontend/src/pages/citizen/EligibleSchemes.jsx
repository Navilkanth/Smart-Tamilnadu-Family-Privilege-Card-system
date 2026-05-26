import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'
import { Sparkles, PlayCircle, ShieldCheck, ChevronRight, Search, FileText } from 'lucide-react'

export default function EligibleSchemes() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState([])
  const [drafts, setDrafts] = useState([])
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const load = () => {
    api.get(`/schemes/eligible?lang=${lang}`).then((r) => setSchemes(r.data))
    api.get('/schemes/drafts').then((r) => setDrafts(r.data)).catch(() => setDrafts([]))
  }

  useEffect(() => { load() }, [lang])

  const rerun = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/schemes/eligibility/run')
      setSchemes(data)
      setMsg('AI eligibility analysis completed successfully.')
      setTimeout(() => setMsg(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const startApply = (schemeId, memberId) => {
    navigate(`/citizen/apply/${schemeId}?memberId=${memberId}`)
  }

  const resumeDraft = (draft) => {
    const memberId = draft.draft_data?.family_member_id
    const q = memberId ? `?memberId=${memberId}` : ''
    navigate(`/citizen/apply/${draft.scheme_id}${q}`)
  }

  return (
    <Layout nav={nav}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/bg-schemes-full.png')" }} />
        <div className="absolute inset-0 bg-indigo-50/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-indigo-800/90 to-tn-green/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles size={160} className="-mt-10 -mr-10" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2 drop-shadow-md">{t('eligibleSchemes')}</h1>
            <p className="text-indigo-100 max-w-xl font-medium">Our AI engine automatically matches your family members to government welfare schemes based on your profile.</p>
          </div>
          <button 
            type="button" 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm" 
            onClick={rerun}
            disabled={isLoading}
          >
            <Sparkles size={18} className={isLoading ? "animate-spin" : ""} /> 
            {isLoading ? "Analyzing..." : "Re-run AI Analysis"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-center gap-3 animate-in shadow-sm">
          <ShieldCheck className="text-green-600" />
          <p className="font-medium">{msg}</p>
        </div>
      )}

      {/* Resume Drafts */}
      {drafts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ClockIcon /> Continue Applications
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {drafts.map((d) => (
              <div key={d.scheme_id} className="bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Step {d.current_step}/4
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-1">{d.scheme?.name || `Scheme #${d.scheme_id}`}</h3>
                  <p className="text-slate-500 text-sm mb-5">You started this application previously.</p>
                  <button type="button" className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all" onClick={() => resumeDraft(d)}>
                    Resume Application <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Schemes */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-indigo-500" /> AI Recommended Schemes
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((e) => (
            <div key={e.id} className="card p-0 overflow-hidden flex flex-col group border-indigo-100 hover:border-indigo-300">
              <div className="bg-indigo-50/50 border-b border-indigo-50 p-4 flex justify-between items-center">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <UserIcon /> {e.member_name}
                </span>
                {e.scheme?.benefit_amount > 0 && (
                  <span className="text-tn-green font-bold bg-green-50 px-2 py-1 rounded text-sm">
                    ₹{e.scheme.benefit_amount.toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{e.scheme?.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{e.match_reason}</p>
                
                <button
                  type="button"
                  className="w-full bg-slate-900 hover:bg-tn-green text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={() => startApply(e.scheme?.id, e.family_member_id)}
                >
                  Apply Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {!schemes.length && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No matches found</h3>
              <p className="text-slate-500 max-w-md mx-auto">Please ensure your family registration is complete and all member details are accurate to see AI-mapped schemes.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  )
}

function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

function UserIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
