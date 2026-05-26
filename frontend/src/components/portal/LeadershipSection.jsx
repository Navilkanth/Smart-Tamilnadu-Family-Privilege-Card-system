import { useLang } from '../../context/LanguageContext'
import PrivilegeCardVisual from './PrivilegeCardVisual'

function GovImage({ src, fallbackSrc, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        if (fallbackSrc && e.target.src !== fallbackSrc) e.target.src = fallbackSrc
      }}
    />
  )
}

export default function LeadershipSection() {
  const { lang } = useLang()
  const ta = lang === 'ta'

  return (
    <section className="bg-white border-y border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-tn-green">
            {ta ? 'முதலமைச்சர் அவர்களின் நலத்திட்ட பார்வை' : 'Chief Minister\'s Welfare Initiative'}
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm md:text-base">
            {ta
              ? 'தமிழ்நாடு விதையக் கட்சி (TVK) மற்றும் தமிழ்நாடு அரசின் கீழ் — ஒவ்வொரு குடும்பத்திற்கும் ஸ்மார்ட் சிறப்பு அட்டை'
              : 'Under Tamil Nadu Government & TVK — Smart Family Privilege Card for every eligible family'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* CM */}
          <div className="text-center">
            <div className="gov-photo-frame mx-auto w-48 h-56 md:w-52 md:h-60 mb-4">
              <GovImage
                src="/gov/cm.jpg"
                fallbackSrc="/gov/cm-placeholder.svg"
                alt={ta ? 'முதலமைச்சர்' : 'Hon\'ble Chief Minister'}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <p className="font-bold text-tn-green text-lg">
              {ta ? 'மாண்புமிகு முதலமைச்சர்' : 'Hon\'ble Chief Minister'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {ta ? 'நலத்திட்ட விநியோகத்தில் வெளிப்படைத்தன்மை' : 'Transparency in welfare delivery'}
            </p>
          </div>

          {/* Privilege Card — center focus */}
          <div className="flex flex-col items-center order-first lg:order-none">
            <PrivilegeCardVisual />
            <p className="mt-4 font-semibold text-tn-maroon text-center">
              {ta ? 'ஸ்மார்ட் குடும்ப சிறப்பு அட்டை' : 'Smart Family Privilege Card'}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1 max-w-xs">
              {ta ? 'ஒரே அட்டை — அனைத்து நலத்திட்டங்கள்' : 'One card · All welfare schemes · AI-enabled'}
            </p>
          </div>

          {/* TVK + Govt */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="bg-tn-cream rounded-xl p-4 border-2 border-tn-gold/40 w-full max-w-[220px]">
                <GovImage
                  src="/gov/tvk-logo.png"
                  fallbackSrc="/gov/tvk-placeholder.svg"
                  alt="TVK"
                  className="h-16 mx-auto object-contain"
                />
                <p className="text-xs font-semibold text-tn-maroon mt-2">Tamilaga Vettri Kazhagam (TVK)</p>
              </div>
              <div className="flex items-center gap-3">
                <GovImage
                  src="/gov/tn-emblem.png"
                  fallbackSrc="/gov/tn-emblem.svg"
                  alt="TN Emblem"
                  className="h-14 w-14 object-contain"
                />
                <div className="text-left text-sm">
                  <p className="font-bold text-tn-green">{ta ? 'தமிழ்நாடு அரசு' : 'Govt. of Tamil Nadu'}</p>
                  <p className="text-gray-500 text-xs">{ta ? 'அதிகாரப்பூர்வ திட்டம்' : 'Official Programme'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
