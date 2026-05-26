import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { useCitizenNav } from './citizenNav'
import { MessageSquare, Send, Clock, HelpCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'benefit', label: 'Benefit Issue' },
  { value: 'card', label: 'Card Issue' },
  { value: 'family_update', label: 'Family Update Request' },
  { value: 'general', label: 'General Complaint' },
]

export default function Complaints() {
  const { t } = useLang()
  const nav = useCitizenNav()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ category: 'general', subject: '', description: '' })
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'history'

  const load = () => api.get('/complaints/mine').then((r) => setList(r.data))

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/complaints/', form)
    setForm({ category: 'general', subject: '', description: '' })
    load()
    setActiveTab('history')
  }

  return (
    <Layout nav={nav}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/bg-complaints-full.png')" }} />
        <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 text-white shadow-md flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 drop-shadow-sm">{t('complaints')}</h1>
              <p className="text-slate-700 font-medium mt-1">Raise support tickets and track resolutions.</p>
            </div>
          </div>
          
          <div className="flex bg-white/60 backdrop-blur-sm border border-slate-200/50 p-1 rounded-lg shadow-sm">
            <button 
              type="button"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setActiveTab('new')}
            >
              New Complaint
            </button>
            <button 
              type="button"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setActiveTab('history')}
            >
              History ({list.length})
            </button>
          </div>
        </div>

      {activeTab === 'new' && (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={submit} className="card border-t-4 border-t-red-500 shadow-md">
              <h2 className="text-lg font-semibold mb-6">Submit a Support Ticket</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Category</label>
                  <select className="input bg-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input className="input bg-white" placeholder="Brief summary of the issue" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                  <textarea className="input bg-white" rows={5} placeholder="Please provide as many details as possible..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="pt-2">
                  <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700 w-full sm:w-auto flex items-center justify-center gap-2">
                    <Send size={16} /> Submit Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="card bg-slate-800 text-white">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-400" />
                Need Immediate Help?
              </h3>
              <p className="text-slate-300 text-sm mb-4">Our dedicated support lines are open from 8:00 AM to 8:00 PM everyday.</p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Toll-Free Helpline</p>
                <p className="text-xl font-mono text-white">1800-425-XXXX</p>
              </div>
            </div>
            
            <div className="card bg-blue-50 border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Response Times</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>General Queries: 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Benefit Issues: Priority (24 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Card Dispatches: Tracked separately</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 max-w-4xl">
          {list.map((c) => (
            <div key={c.id} className="card p-0 overflow-hidden group">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                      {CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(c.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-semibold text-lg text-slate-800 mb-1">{c.subject}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">{c.description}</p>
                </div>
                <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <StatusBadge status={c.status} />
                  <button type="button" className="text-tn-green text-sm font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    View Thread
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!list.length && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No complaint history.</p>
              <p className="text-slate-400 text-sm mt-1">If you face any issues, submit a new ticket.</p>
            </div>
          )}
        </div>
      )}
      </div>
    </Layout>
  )
}
