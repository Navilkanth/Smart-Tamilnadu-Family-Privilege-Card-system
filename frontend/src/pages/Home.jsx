import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import PublicLayout from '../layouts/PublicLayout'
import HeroCarousel from '../components/portal/HeroCarousel'
import LeadershipSection from '../components/portal/LeadershipSection'
import { Sparkles, Shield, Users, FileText, Landmark } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const ta = lang === 'ta'

  return (
    <PublicLayout fullWidth>
      <HeroCarousel />
      <LeadershipSection />

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Landmark className="text-tn-gold" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-tn-green text-center">
            {t('whyChoose')}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, title: t('docGuide'), desc: t('docGuideDesc') },
            { icon: Sparkles, title: t('aiElig'), desc: t('aiEligDesc') },
            { icon: Shield, title: t('fraudDet'), desc: t('fraudDetDesc') },
            { icon: Users, title: t('unifiedCard'), desc: t('unifiedCardDesc') },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="gov-feature-card bg-white rounded-lg p-6 border border-gray-200 text-center hover:border-tn-green/40 transition"
            >
              <div className="w-14 h-14 mx-auto rounded-lg bg-tn-green/10 flex items-center justify-center mb-4 border border-tn-green/20">
                <Icon className="text-tn-green" size={30} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 gov-announcement rounded-lg p-6 md:p-8 text-center">
          <p className="text-sm font-semibold text-tn-maroon uppercase tracking-wide mb-2">
            {ta ? 'அதிகாரப்பூர்வ அறிவிப்பு' : 'Official Announcement'}
          </p>
          <p className="text-gray-800 max-w-3xl mx-auto">
            {ta
              ? 'முதலமைச்சர் அவர்களின் வழிகாட்டுதலின் கீழ், தமிழ்நாட்டின் ஒவ்வொரு தகுதியுள்ள குடும்பத்திற்கும் ஸ்மார்ட் குடும்ப சிறப்பு அட்டை வழங்கப்படுகிறது. AI மூலம் நலத்திட்ட தகுதி தானாகவே கண்டறியப்படும்.'
              : 'Under the guidance of the Hon\'ble Chief Minister, every eligible family in Tamil Nadu receives the Smart Family Privilege Card with AI-powered automatic welfare eligibility.'}
          </p>
          {!user && (
            <Link to="/register" className="gov-btn-primary inline-block mt-6 text-base px-10 py-3 rounded-md">
              {t('getStarted')}
            </Link>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
