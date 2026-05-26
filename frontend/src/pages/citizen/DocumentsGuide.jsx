import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'
import { FileText, AlertCircle } from 'lucide-react'

export default function DocumentsGuide() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const [docs, setDocs] = useState([])

  useEffect(() => {
    api.get(`/family/documents-guide?lang=${lang}`).then((r) => setDocs(r.data))
  }, [lang])

  return (
    <Layout nav={nav}>
      <h1 className="font-display text-3xl text-tn-green font-bold mb-2">{t('documentsGuide')}</h1>
      <p className="text-gray-600 mb-8">
        {t('documentsGuideHint')}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {docs.map((d) => (
          <div key={d.code} className="card flex gap-4">
            <FileText className="text-tn-green shrink-0" size={28} />
            <div>
              <h3 className="font-semibold">{d.name}</h3>
              {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
              {d.is_conditional && (
                <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {d.condition_note || 'If applicable'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link to="/citizen/register-family" className="btn-primary">{t('startRegister')}</Link>
    </Layout>
  )
}
