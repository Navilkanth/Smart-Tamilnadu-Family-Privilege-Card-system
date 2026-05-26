import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')

  const toggle = () => {
    const next = lang === 'en' ? 'ta' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const t = (key) => translations[lang][key] || translations.en[key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
