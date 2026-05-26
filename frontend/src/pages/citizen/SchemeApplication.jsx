import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'
import { AlertTriangle, CheckCircle2, Save, ArrowLeft, ArrowRight } from 'lucide-react'

const TOTAL_STEPS = 4

export default function SchemeApplication() {
  const { schemeId } = useParams()
  const [searchParams] = useSearchParams()
  const memberId = searchParams.get('memberId')
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const ta = lang === 'ta'

  const [step, setStep] = useState(1)
  const [scheme, setScheme] = useState(null)
  const [memberName, setMemberName] = useState('')
  const [missing, setMissing] = useState([])
  const [warnings, setWarnings] = useState([])
  const [draftData, setDraftData] = useState({
    notes: '',
    documents_confirmed: {},
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeBanner, setResumeBanner] = useState(false)

  const loadDocumentCheck = useCallback(async () => {
    const { data } = await api.get(`/schemes/document-check/${schemeId}?lang=${lang}`)
    setMissing(data.missing_documents || [])
    setWarnings(data.warnings || data.missing_documents || [])
    return data
  }, [schemeId, lang])

  useEffect(() => {
    const init = async () => {
      try {
        const [draftRes, schemesRes] = await Promise.all([
          api.get(`/schemes/drafts/${schemeId}`),
          api.get(`/schemes/eligible?lang=${lang}`),
        ])
        const entry = schemesRes.data.find(
          (e) => String(e.scheme?.id) === String(schemeId) && (!memberId || String(e.family_member_id) === memberId),
        )
        if (entry) {
          setScheme(entry.scheme)
          setMemberName(entry.member_name)
        }
        const draft = draftRes.data
        if (draft.current_step > 1 || Object.keys(draft.draft_data || {}).length > 0) {
          setStep(draft.current_step || 1)
          setDraftData((d) => ({ ...d, ...draft.draft_data }))
          setResumeBanner(true)
        }
        if (draft.missing_documents?.length) {
          setMissing(draft.missing_documents)
        }
        await loadDocumentCheck()
      } catch {
        navigate('/citizen/schemes')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [schemeId, memberId, lang, loadDocumentCheck, navigate])

  const saveDraft = async (nextStep, dataPatch = {}) => {
    setSaving(true)
    const merged = { ...draftData, ...dataPatch }
    setDraftData(merged)
    try {
      const { data } = await api.post('/schemes/drafts', {
        scheme_id: Number(schemeId),
        current_step: nextStep,
        lang,
        draft_data: {
          family_member_id: memberId ? Number(memberId) : null,
          member_name: memberName,
          ...merged,
        },
      })
      setMissing(data.missing_documents || [])
      setWarnings(data.warnings || data.missing_documents || [])
    } finally {
      setSaving(false)
    }
  }

  const goNext = async () => {
    if (step === 2) {
      const check = await loadDocumentCheck()
      const docs = check.missing_documents || []
      const stillMissing = docs.filter((m) => !draftData.documents_confirmed?.[m.code])
      if (stillMissing.length > 0) {
        return
      }
    }
    const next = Math.min(step + 1, TOTAL_STEPS)
    await saveDraft(next)
    setStep(next)
    setResumeBanner(false)
  }

  const goBack = () => {
    const prev = Math.max(step - 1, 1)
    setStep(prev)
    saveDraft(prev)
  }

  const saveAndExit = async () => {
    await saveDraft(step)
    navigate('/citizen/schemes')
  }

  const toggleDocConfirmed = (code) => {
    setDraftData((d) => ({
      ...d,
      documents_confirmed: {
        ...d.documents_confirmed,
        [code]: !d.documents_confirmed?.[code],
      },
    }))
  }

  const submitApplication = async () => {
    setSaving(true)
    try {
      await api.post('/schemes/applications', {
        scheme_id: Number(schemeId),
        family_member_id: memberId ? Number(memberId) : null,
        force: true,
      })
      navigate('/citizen/benefits')
    } catch (e) {
      if (e.response?.data?.error === 'missing_documents') {
        setMissing(e.response.data.missing_documents)
        setStep(2)
        await saveDraft(2)
      }
    } finally {
      setSaving(false)
    }
  }

  const docLabel = (doc) => (ta ? doc.name_ta || doc.name_en : doc.name_en || doc.name_ta || doc.code)

  const warningMessage = (doc) => {
    if (doc.code === 'aadhaar_pending') {
      return ta ? 'ஆதார் சரிபார்ப்பு நிலுவையில்' : 'Aadhaar Verification Pending'
    }
    return ta ? `${docLabel(doc)} காணவில்லை` : `${docLabel(doc)} Missing`
  }

  if (loading) {
    return <Layout nav={nav}><p className="text-center py-20">Loading...</p></Layout>
  }

  return (
    <Layout nav={nav}>
      <div className="max-w-2xl mx-auto">
        <Link to="/citizen/schemes" className="text-sm text-tn-green flex items-center gap-1 mb-4 hover:underline">
          <ArrowLeft size={16} /> {ta ? 'திட்டங்களுக்கு திரும்பு' : 'Back to schemes'}
        </Link>

        <h1 className="font-display text-2xl text-tn-green font-bold mb-1">{scheme?.name}</h1>
        <p className="text-gray-600 text-sm mb-6">
          {ta ? 'விண்ணப்பிப்பவர்' : 'Applicant'}: <strong>{memberName}</strong>
        </p>

        {resumeBanner && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            {ta
              ? `நீங்கள் படி ${step} இல் தொடர்கிறீர்கள் — முதல் படியிலிருந்து மீண்டும் தொடங்க வேண்டாம்.`
              : `Resuming at step ${step} — continue where you left off.`}
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-tn-green' : 'bg-gray-200'}`}
              title={ta ? `படி ${s}` : `Step ${s}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{ta ? 'படி 1: விண்ணப்ப விவரங்கள்' : 'Step 1: Application details'}</h2>
            <p className="text-sm text-gray-600">{scheme?.description || scheme?.name}</p>
            <p className="text-sm">
              {ta ? 'பயன் தொகை' : 'Benefit'}: <strong>₹{scheme?.benefit_amount?.toLocaleString()}</strong>
            </p>
            <div>
              <label className="text-sm font-medium">{ta ? 'குறிப்புகள் (விரும்பினால்)' : 'Notes (optional)'}</label>
              <textarea
                className="input mt-1"
                rows={3}
                value={draftData.notes || ''}
                onChange={(e) => setDraftData((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{ta ? 'படி 2: ஆவண சரிபார்ப்பு' : 'Step 2: Smart Document Checker'}</h2>
            <p className="text-sm text-gray-600">
              {ta ? 'காணாமல் போன ஆவணங்களை சரிசெய்து, ஒவ்வொன்றையும் உறுதிப்படுத்தவும்.' : 'Resolve missing items and confirm each document is ready.'}
            </p>

            {(warnings.length ? warnings : missing).map((doc) => {
              const isPending = doc.code === 'aadhaar_pending'
              const confirmed = draftData.documents_confirmed?.[doc.code]
              return (
                <div
                  key={doc.code}
                  className={`p-4 rounded-lg border flex gap-3 ${
                    confirmed ? 'bg-green-50 border-green-200' : isPending ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-200'
                  }`}
                >
                  {confirmed ? (
                    <CheckCircle2 className="text-tn-green shrink-0" size={22} />
                  ) : (
                    <AlertTriangle className={isPending ? 'text-amber-600' : 'text-red-600'} size={22} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{warningMessage(doc)}</p>
                    {!confirmed && (
                      <label className="mt-2 flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!confirmed}
                          onChange={() => toggleDocConfirmed(doc.code)}
                        />
                        {ta ? 'ஆவணம் தயார் / பதிவேற்றம் செய்துள்ளேன்' : 'I have uploaded / submitted this document'}
                      </label>
                    )}
                  </div>
                </div>
              )
            })}

            {missing.length === 0 && (
              <p className="text-tn-green flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} /> {ta ? 'அனைத்து ஆவணங்களும் சரி!' : 'All documents verified!'}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{ta ? 'படி 3: உறுதிப்படுத்தல்' : 'Step 3: Confirm submission'}</h2>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• {scheme?.name}</li>
              <li>• {memberName}</li>
              <li>• {draftData.notes || (ta ? 'குறிப்பு இல்லை' : 'No notes')}</li>
            </ul>
            <p className="text-xs text-gray-500">
              {ta ? 'உங்கள் முன்னேற்றம் சேமிக்கப்பட்டுள்ளது.' : 'Your progress has been saved automatically.'}
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{ta ? 'படி 4: விண்ணப்பம் சமர்ப்பி' : 'Step 4: Submit application'}</h2>
            <p className="text-sm text-gray-600">
              {ta ? 'சமர்ப்பித்த பிறகு நீங்கள் நன்மை கண்காணிப்பில் நிலையைப் பார்க்கலாம்.' : 'After submitting, track status under Benefit Tracking.'}
            </p>
            <button type="button" className="btn-primary w-full" onClick={submitApplication} disabled={saving}>
              {ta ? 'விண்ணப்பத்தை சமர்ப்பி' : 'Submit Application'}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {step > 1 && (
            <button type="button" className="btn-secondary flex items-center gap-2" onClick={goBack}>
              <ArrowLeft size={16} /> {t('back')}
            </button>
          )}
          <button type="button" className="btn-secondary flex items-center gap-2" onClick={saveAndExit} disabled={saving}>
            <Save size={16} /> {t('saveProgress')}
          </button>
          {step < TOTAL_STEPS && (
            <button type="button" className="btn-primary flex items-center gap-2 ml-auto" onClick={goNext} disabled={saving}>
              {t('next')} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
