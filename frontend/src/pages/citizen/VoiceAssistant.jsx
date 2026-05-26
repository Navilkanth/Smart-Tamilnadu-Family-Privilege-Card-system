import { useState } from 'react'
import api from '../../api/client'
import { useLang } from '../../context/LanguageContext'
import Layout from '../../components/Layout'
import { useCitizenNav } from './citizenNav'
import { Mic, Volume2 } from 'lucide-react'

export default function VoiceAssistant() {
  const { lang, t } = useLang()
  const nav = useCitizenNav()
  const [question, setQuestion] = useState(lang === 'ta' ? 'எனக்கு என்ன திட்டம் கிடைக்கும்?' : 'What schemes am I eligible for?')
  const [answer, setAnswer] = useState('')
  const [listening, setListening] = useState(false)

  const ask = async () => {
    const { data } = await api.post('/support/ask', { question, lang })
    setAnswer(data.answer)
  }

  const readAloud = () => {
    if (!answer || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(answer)
    u.lang = lang === 'ta' ? 'ta-IN' : 'en-IN'
    window.speechSynthesis.speak(u)
  }

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setAnswer('Voice input not supported in this browser. Type your question instead.')
      return
    }
    const rec = new SR()
    rec.lang = lang === 'ta' ? 'ta-IN' : 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = (e) => setQuestion(e.results[0][0].transcript)
    rec.start()
  }

  return (
    <Layout nav={nav}>
      <h1 className="font-display text-3xl text-tn-green font-bold mb-6">{t('voiceAssist')}</h1>
      <div className="card max-w-2xl space-y-4">
        <p className="text-sm text-gray-600">Simple guided UI · Tamil & English · Read-aloud support</p>
        <textarea className="input" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('askQuestion')} />
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={ask}>Ask</button>
          <button type="button" className="btn-secondary flex items-center gap-2" onClick={startListen}>
            <Mic size={18} /> {listening ? 'Listening...' : t('listen')}
          </button>
          <button type="button" className="btn-secondary flex items-center gap-2" onClick={readAloud} disabled={!answer}>
            <Volume2 size={18} /> {t('speak')}
          </button>
        </div>
        {answer && (
          <div className="bg-tn-cream border border-tn-green/30 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
            {answer}
          </div>
        )}
      </div>
    </Layout>
  )
}
