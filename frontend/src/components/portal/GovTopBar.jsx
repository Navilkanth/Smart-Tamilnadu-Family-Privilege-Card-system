import { useLang } from '../../context/LanguageContext'

export default function GovTopBar() {
  const { lang } = useLang()
  const ta = lang === 'ta'

  return (
    <div className="gov-tricolor-thin" role="presentation">
      <div className="gov-top-bar-inner text-white text-xs md:text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <img src="/gov/tn-emblem.svg" alt="" className="h-4 w-4 md:h-5 md:w-5" />
            {ta ? 'தமிழ்நாடு அரசு — அதிகாரப்பூர்வ நலத்திட்ட வாயில்' : 'Government of Tamil Nadu — Official Welfare Portal'}
          </span>
          <span className="text-green-200 hidden sm:inline">
            {ta ? 'முதலமைச்சர் அவர்களின் நலத்திட்ட முன்மையில்' : 'Under Hon\'ble Chief Minister\'s welfare initiative'}
          </span>
        </div>
      </div>
    </div>
  )
}
