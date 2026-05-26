import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { useCitizenNav } from './citizenNav'
import { PackageOpen, Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function BenefitTracking() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const [apps, setApps] = useState([])

  useEffect(() => {
    api.get(`/schemes/applications?lang=${lang}`).then((r) => setApps(r.data))
  }, [lang])

  return (
    <Layout nav={nav}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/bg-benefits-full.png')" }} />
        <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-tn-green text-white shadow-md flex items-center justify-center">
            <PackageOpen size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 drop-shadow-sm">{t('benefits')}</h1>
            <p className="text-slate-700 font-medium mt-1">Track and manage your family's scheme applications.</p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
        {apps.map((a) => (
          <div key={a.id} className="card p-0 overflow-hidden border-l-4" style={{ borderLeftColor: a.status === 'approved' ? '#10b981' : a.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{a.scheme?.name}</h3>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                    <UserIcon /> Member: <span className="text-slate-700">{a.member_name}</span>
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              {a.rejection_reason && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex gap-2 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{a.rejection_reason}</p>
                </div>
              )}

              {a.benefit_amount > 0 && (
                <div className="mb-4 bg-green-50 text-green-800 p-3 rounded-lg border border-green-100 flex gap-2 text-sm font-medium items-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p>Approved Amount: ₹{a.benefit_amount.toLocaleString()}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Applied</p>
                    <p>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                {a.approved_at && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <div>
                      <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Approved</p>
                      <p>{new Date(a.approved_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {a.credited_at && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} className="text-tn-green" />
                    <div>
                      <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Credited</p>
                      <p>{new Date(a.credited_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {a.credits?.length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Credit History</p>
                  <div className="space-y-2">
                    {a.credits.map((c) => (
                      <div key={c.id} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm border border-slate-200">
                        <span className="font-medium text-tn-green">₹{c.amount.toLocaleString()}</span>
                        <span className="text-slate-500 text-xs font-mono">{c.reference_number}</span>
                        <span className="text-slate-500">{new Date(c.credit_date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {!apps.length && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <PackageOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No benefit applications yet.</p>
            <p className="text-slate-400 text-sm mt-1">When you apply for schemes, you can track them here.</p>
          </div>
        )}
        </div>
      </div>
    </Layout>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
}
