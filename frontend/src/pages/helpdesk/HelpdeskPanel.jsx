import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { Headset, AlertCircle, Clock, CheckCircle2, Search, Filter } from 'lucide-react'

export default function HelpdeskPanel() {
  const { t } = useLang()
  const [queue, setQueue] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, under_review

  const load = () => api.get('/complaints/helpdesk/queue').then((r) => setQueue(r.data))

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/complaints/${id}/status`, { status })
    load()
  }

  const nav = [{ to: '/helpdesk', label: t('helpdeskPanel') }]

  const filteredQueue = queue.filter(c => filter === 'all' ? true : c.status === filter)

  return (
    <Layout nav={nav}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-800 font-bold flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Headset size={28} />
            </div>
            {t('helpdeskPanel')}
          </h1>
          <p className="text-slate-500 mt-2">Manage and resolve citizen support tickets</p>
        </div>
        
        <div className="flex gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          <button 
            type="button" 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setFilter('all')}
          >
            All Tickets
          </button>
          <button 
            type="button" 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            type="button" 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'under_review' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setFilter('under_review')}
          >
            Under Review
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2 px-1">
            <span>{filteredQueue.length} Tickets in Queue</span>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 hover:text-slate-800"><Filter size={14}/> Filter</button>
              <button className="flex items-center gap-1 hover:text-slate-800"><Search size={14}/> Search</button>
            </div>
          </div>
          
          {filteredQueue.map((c) => (
            <div key={c.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow group">
              <div className={`h-1 w-full ${c.status === 'pending' ? 'bg-amber-400' : c.status === 'under_review' ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
              <div className="p-5 flex flex-col sm:flex-row gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(c.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-auto">ID: #{c.id || Math.floor(Math.random()*1000)}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{c.subject}</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{c.description}</p>
                </div>
                
                <div className="sm:w-48 flex flex-col justify-between border-l border-slate-100 pl-5">
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Current Status</p>
                    <StatusBadge status={c.status} />
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    {c.status === 'pending' && (
                      <button type="button" className="w-full btn-secondary text-sm py-1.5 flex items-center justify-center gap-1" onClick={() => updateStatus(c.id, 'under_review')}>
                        <Search size={14} /> Review Issue
                      </button>
                    )}
                    {(c.status === 'pending' || c.status === 'under_review') && (
                      <button type="button" className="w-full btn-primary bg-green-600 hover:bg-green-700 text-sm py-1.5 flex items-center justify-center gap-1 shadow-sm" onClick={() => updateStatus(c.id, 'resolved')}>
                        <CheckCircle2 size={14} /> Mark Resolved
                      </button>
                    )}
                    <button type="button" className="w-full text-red-600 border border-red-200 hover:bg-red-50 text-sm font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors" onClick={() => updateStatus(c.id, 'escalated')}>
                      <AlertCircle size={14} /> Escalate to Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!filteredQueue.length && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <CheckCircle2 size={48} className="mx-auto text-green-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">Queue is empty!</p>
              <p className="text-slate-400 text-sm mt-1">Great job! All tickets in this view have been processed.</p>
            </div>
          )}
        </div>
        
        {/* Helpdesk Sidebar */}
        <div className="space-y-6">
          <div className="card bg-slate-800 text-white">
            <h3 className="font-semibold text-lg mb-2">My Performance</h3>
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Resolution Rate</span>
                  <span className="font-medium text-white">92%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Avg Response Time</span>
                  <span className="font-medium text-white">4.2 hrs</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Guidelines</h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex items-start gap-2">
                <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">1</span>
                Review all details before marking a ticket as resolved.
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-100 text-red-700 w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">2</span>
                Escalate complex benefit issues or fraud to Admins immediately.
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">3</span>
                Change status to "Under Review" when waiting for user response.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
