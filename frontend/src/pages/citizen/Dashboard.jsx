import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { useCitizenNav } from './citizenNav'
import { CreditCard, Bell, FileText, ChevronRight, User, Users, Sparkles, MapPin, CheckCircle2, Truck } from 'lucide-react'

export default function CitizenDashboard() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/family/dashboard?lang=${lang}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.status === 404 ? 'no_family' : 'error'))
  }, [lang])

  if (error === 'no_family') {
    return (
      <Layout nav={nav}>
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in">
          <div className="w-24 h-24 bg-green-100 text-tn-green rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Users size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('noFamily')}</h2>
          <p className="text-slate-500 mb-8 max-w-md">Register your family to get your Smart Privilege Card and discover schemes you are eligible for automatically.</p>
          <Link to="/citizen/documents" className="btn-primary shadow-lg hover:shadow-xl px-8 py-3 text-lg">
            {t('startRegister')}
          </Link>
        </div>
      </Layout>
    )
  }

  if (!data) return (
    <Layout nav={nav}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tn-green"></div>
      </div>
    </Layout>
  )

  return (
    <Layout nav={nav}>
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column - Card & Notifications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Smart Privilege Card */}
          <div className="privilege-card-3d w-full max-w-[480px]">
            <div className="privilege-card-mock smart-card-bg rounded-2xl shadow-2xl p-6 text-white border border-white/10 relative">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <img src="/gov/tn-emblem.png" alt="TN" className="h-10 w-10 brightness-0 invert" />
                  <div>
                    <h3 className="font-semibold text-sm opacity-90 uppercase tracking-widest">Tamil Nadu Government</h3>
                    <p className="text-[10px] opacity-75">Smart Family Privilege Card</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border backdrop-blur-md ${data.registration_status === 'approved' ? 'bg-green-400/20 border-green-400/30 text-green-400' : 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400'}`}>
                  <span className="text-xs font-bold tracking-wide uppercase">
                    {data.registration_status === 'approved' ? 'Active' : data.registration_status}
                  </span>
                </div>
              </div>
              
              <div className="mb-6 relative z-10">
                <div className="w-12 h-8 bg-yellow-200/80 rounded-md border border-yellow-400/50 mb-4 opacity-80" style={{ backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.4) 60%, transparent 60%)', backgroundSize: '4px 4px' }}></div>
                <p className="font-mono text-2xl tracking-[0.2em] font-bold drop-shadow-md">
                  {data.privilege_card_id?.match(/.{1,4}/g)?.join(' ') || data.privilege_card_id}
                </p>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Family Head</p>
                  <p className="font-semibold tracking-wide">{data.family?.family_head_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Members</p>
                  <p className="font-semibold">{data.family?.members?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Family Profile */}
            <div className="card border-t-4 border-t-tn-green">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><User size={18} className="text-tn-green" /> Profile</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Address</p>
                  <p className="text-sm font-medium flex items-start gap-1 mt-1">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    {data.family?.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Members ({data.family?.members?.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {data.family?.members?.slice(0, 3).map((m) => (
                      <span key={m.id} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200">
                        {m.name.split(' ')[0]}
                      </span>
                    ))}
                    {data.family?.members?.length > 3 && (
                      <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-medium border border-slate-200">
                        +{data.family.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Bell size={18} className="text-amber-500" /> Notifications</h3>
              <ul className="text-sm space-y-3">
                {data.notifications?.length ? data.notifications.slice(0,3).map((n) => (
                  <li key={n.id} className="flex gap-3 items-start pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-slate-700">{n.title}</span>
                  </li>
                )) : <li className="text-slate-500 italic">No new notifications</li>}
              </ul>
            </div>
          </div>

          {/* Pending Benefits */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Recent Applications</h3>
              <Link to="/citizen/benefits" className="text-tn-green text-sm font-semibold hover:underline">View All</Link>
            </div>
            
            <div className="space-y-3">
              {data.pending_benefits?.length ? data.pending_benefits.slice(0,3).map((a) => (
                <div key={a.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded shadow-sm border border-slate-200">
                      <FileText size={16} className="text-tn-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{a.scheme?.name}</p>
                      <p className="text-xs text-slate-500">{new Date(a.applied_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              )) : (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No recent applications.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recommendations & Timeline */}
        <div className="space-y-8">
          
          {/* AI Schemes */}
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-indigo-600" />
              <h3 className="font-semibold text-lg text-indigo-900">AI Recommendations</h3>
            </div>
            <p className="text-sm text-indigo-700 mb-4">Based on your family profile, you are eligible for these benefits.</p>
            
            <div className="space-y-3">
              {data.eligible_schemes?.slice(0, 4).map((e) => (
                <div key={e.id} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow cursor-pointer">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{e.member_name}</p>
                  <p className="text-sm font-medium text-slate-800 leading-tight">{e.scheme?.name}</p>
                </div>
              ))}
            </div>
            
            <Link to="/citizen/schemes" className="btn-primary w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200">
              Review & Apply <ChevronRight size={16} />
            </Link>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-6">Card Status Tracking</h3>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
              {data.card_tracking?.map((ev, i) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${i === 0 ? 'bg-tn-green' : 'bg-slate-300'}`}></div>
                  <div className="mb-1">
                    <StatusBadge status={ev.status} />
                  </div>
                  <p className="text-xs font-medium text-slate-500">{new Date(ev.event_at).toLocaleString()}</p>
                </div>
              ))}
              
              {/* Dummy nodes if tracking is empty just to show design */}
              {!data.card_tracking?.length && (
                <>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-tn-green shadow-sm flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">Registration Approved</p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-slate-300 shadow-sm"></div>
                    <p className="text-sm font-medium text-slate-400">Card Printed</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-slate-300 shadow-sm"></div>
                    <p className="text-sm font-medium text-slate-400">Card Dispatched</p>
                  </div>
                </>
              )}
            </div>

            {data.registration_status === 'approved' && (
              <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                 <Truck className="text-blue-500 mt-0.5 shrink-0" size={20} />
                 <div>
                   <p className="text-sm font-semibold text-blue-900 mb-1">Card Delivery Update</p>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     Your physical Smart Privilege Card has been dispatched and will be delivered to: <br/>
                     <span className="font-semibold text-slate-800">{data.family?.address}</span>
                   </p>
                   <p className="text-sm font-bold text-blue-800 mt-2 bg-blue-100 inline-block px-2 py-1 rounded">
                     Estimated Arrival: 5 to 7 working days
                   </p>
                 </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </Layout>
  )
}
