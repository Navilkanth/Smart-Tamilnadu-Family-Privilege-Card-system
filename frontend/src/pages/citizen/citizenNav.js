import { useLang } from '../../context/LanguageContext'

export function useCitizenNav() {
  const { t } = useLang()
  return [
    { to: '/citizen/dashboard', label: t('dashboard') },
    { to: '/citizen/documents', label: t('documentsGuide') },
    { to: '/citizen/register-family', label: t('familyRegister') },
    { to: '/citizen/schemes', label: t('eligibleSchemes') },
    { to: '/citizen/benefits', label: t('benefits') },
    { to: '/citizen/complaints', label: t('complaints') },
    { to: '/citizen/helpdesk', label: t('helpdesk') },
    { to: '/citizen/voice', label: t('voiceAssist') },
  ]
}
