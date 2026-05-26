import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { Users, FileCheck, Clock, CheckCircle, AlertTriangle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react'

export default function AdminDashboard() {
  const { t } = useLang()
  const [stats, setStats] = useState(null)
  const [families, setFamilies] = useState([])
  const [fraud, setFraud] = useState([])
  const [complaints, setComplaints] = useState([])
  const [recs, setRecs] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)

  const load = () => {
    api.get('/admin/dashboard').then((r) => setStats(r.data))
    api.get('/admin/families').then((r) => setFamilies(r.data))
    api.get('/admin/fraud-alerts').then((r) => setFraud(r.data.filter((a) => !a.is_resolved)))
    api.get('/admin/complaints').then((r) => setComplaints(r.data))
    api.get('/admin/recommendations').then((r) => setRecs(r.data))
  }

  useEffect(() => { load() }, [])

  const verifyFamily = async (id, status) => {
    await api.patch(`/admin/families/${id}/verify`, { registration_status: status })
    load()
  }

  const resolveFraud = async (id) => {
    await api.patch(`/admin/fraud-alerts/${id}/resolve`)
    load()
  }

  const runRecommendations = async () => {
    setIsSyncing(true)
    await api.post('/admin/recommendations/run-all')
    load()
    setTimeout(() => setIsSyncing(false), 800)
  }

  const nav = [{ to: '/admin', label: t('adminPanel') }]

  if (!stats) return (
    <Layout nav={nav}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tn-green"></div>
      </div>
    </Layout>
  )

  const statCards = [
    { label: 'Total Registrations', val: stats.total_registrations, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Approved', val: stats.approved_registrations, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending Verification', val: stats.pending_registrations, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Total Beneficiaries', val: stats.total_beneficiaries, icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Pending Benefits', val: stats.pending_benefits, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Fraud Alerts', val: stats.fraud_cases, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Open Complaints', val: stats.open_complaints, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'New AI Matches', val: stats.newly_eligible_families, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ]

  return (
    <Layout nav={nav}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-800 font-bold">{t('adminPanel')}</h1>
          <p className="text-slate-500 mt-1">System Overview & Management</p>
        </div>
        <button 
          type="button" 
          className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
          onClick={runRecommendations}
          disabled={isSyncing}
        >
          <Sparkles size={16} className={isSyncing ? "animate-spin" : ""} /> 
          {isSyncing ? "Running..." : "Run Global AI Analysis"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{s.val}</p>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Family Verification Table */}
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-tn-green" /> Family Registrations
            </h2>
            <span className="badge bg-green-100 text-green-700">{families.length} Total</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
            <table className="modern-table">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th>Card ID</th>
                  <th>Family Head</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {families.slice(0, 10).map((f) => (
                  <tr key={f.id}>
                    <td className="font-mono text-slate-600 font-medium">{f.privilege_card_id}</td>
                    <td className="font-medium text-slate-800">{f.family_head_name}</td>
                    <td><StatusBadge status={f.registration_status} /></td>
                    <td>
                      {f.registration_status === 'pending' ? (
                        <button type="button" className="text-xs btn-primary bg-tn-green py-1 px-3 shadow-none hover:shadow-md" onClick={() => verifyFamily(f.id, 'approved')}>
                          Approve
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!families.length && (
                  <tr><td colSpan="4" className="text-center text-slate-500 py-8">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fraud Alerts */}
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-red-800 flex items-center gap-2">
              <ShieldAlert size={18} /> Fraud Alerts
            </h2>
            <span className="badge bg-red-100 text-red-700">{fraud.length} Active</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
            <table className="modern-table">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fraud.map((a) => (
                  <tr key={a.id} className="bg-red-50/20 hover:bg-red-50/50">
                    <td className="font-semibold text-red-700">{a.alert_type}</td>
                    <td className="text-slate-600 max-w-[200px] truncate" title={a.description}>{a.description}</td>
                    <td className="text-right">
                      <button type="button" className="text-xs btn-secondary py-1 px-3 border-red-200 text-red-600 hover:bg-red-50" onClick={() => resolveFraud(a.id)}>
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
                {!fraud.length && (
                  <tr><td colSpan="3" className="text-center text-slate-500 py-8">System is secure. No active alerts.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Escalated Complaints */}
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-purple-600" /> Escalated Complaints
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
            <table className="modern-table">
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-slate-800">{c.subject}</td>
                    <td className="text-right"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
                {!complaints.length && (
                  <tr><td colSpan="2" className="text-center text-slate-500 py-8">No escalated complaints.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-indigo-50/50">
            <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
              <Sparkles size={18} /> Global AI Recommendations
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
            <table className="modern-table">
              <tbody>
                {recs.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-slate-800">{r.scheme?.name_en || r.scheme?.name}</td>
                    <td className="text-slate-500 text-xs">{r.trigger_reason}</td>
                  </tr>
                ))}
                {!recs.length && (
                  <tr><td colSpan="2" className="text-center text-slate-500 py-8">No new recommendations today.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
