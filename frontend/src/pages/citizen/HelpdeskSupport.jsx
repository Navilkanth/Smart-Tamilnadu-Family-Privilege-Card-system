import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'
import { Phone, Mail, MessageCircle } from 'lucide-react'

const icons = { phone: Phone, email: Mail, whatsapp: MessageCircle }

export default function HelpdeskSupport() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    api.get(`/support/helpdesk-contacts?lang=${lang}`).then((r) => setContacts(r.data))
  }, [lang])

  return (
    <Layout nav={nav}>
      <h1 className="font-display text-3xl text-tn-green font-bold mb-2">{t('helpdesk')}</h1>
      <p className="text-gray-600 mb-8">24/7 support — Phone, WhatsApp, Email</p>
      <div className="grid md:grid-cols-3 gap-6">
        {contacts.map((c) => {
          const Icon = icons[c.contact_type] || Phone
          return (
            <div key={c.value} className="card text-center">
              <Icon className="mx-auto text-tn-green mb-3" size={32} />
              <p className="font-semibold">{c.label}</p>
              <p className="text-tn-maroon font-mono mt-2">{c.value}</p>
            </div>
          )
        })}
      </div>
      <p className="mt-8 text-sm text-gray-600">
        Unresolved complaints are automatically escalated from Helpdesk to Admin.
      </p>
    </Layout>
  )
}
