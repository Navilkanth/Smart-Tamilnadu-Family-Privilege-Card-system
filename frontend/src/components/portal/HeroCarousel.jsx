import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../../context/LanguageContext'
import { heroSlides } from '../../data/heroSlides'

const INTERVAL_MS = 5000

function useSlideImage(slide) {
  const [src, setSrc] = useState(slide.fallback)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setSrc(slide.image)
    img.onerror = () => setSrc(slide.fallback)
    img.src = slide.image
  }, [slide.image, slide.fallback])
  return src
}

export default function HeroCarousel() {
  const { lang } = useLang()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length)
  }, [])

  const prev = () => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(next, INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, next])

  const slide = heroSlides[index]
  const bgSrc = useSlideImage(slide)
  const ta = lang === 'ta'

  return (
    <section
      className="relative overflow-hidden min-h-[440px] md:min-h-[500px] bg-tn-green"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Single background — no stacked slides (fixes overlap/lag) */}
      <div className="absolute inset-0 z-0">
        <img
          key={slide.id}
          src={bgSrc}
          alt=""
          className="w-full h-full object-cover hero-bg-fade"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-tn-green/95 via-tn-green/85 to-tn-green/55" />
        <div className="absolute inset-0 hero-pattern opacity-20 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="max-w-2xl text-white">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-green-100 text-xs font-semibold uppercase tracking-wider mb-3 border border-white/20">
            {ta ? 'தமிழ்நாடு அரசு' : 'Government of Tamil Nadu'}
          </span>
          <p className="text-green-100 text-sm md:text-base mb-1">{ta ? slide.titleTa : slide.titleEn}</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-sm">
            {ta ? slide.titleHighlightTa : slide.titleHighlightEn}
          </h1>
          <p className="text-green-50 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
            {ta ? slide.descTa : slide.descEn}
          </p>
          <Link
            to={slide.ctaLink}
            className="inline-block bg-white text-tn-green font-bold px-8 py-3.5 rounded-md shadow-lg hover:bg-amber-50 transition border-2 border-amber-400/50"
          >
            {ta ? slide.ctaTa : slide.ctaEn}
          </Link>
        </div>
      </div>

      <button type="button" onClick={prev} className="carousel-arrow left-3 md:left-4" aria-label="Previous">
        <ChevronLeft size={26} />
      </button>
      <button type="button" onClick={next} className="carousel-arrow right-3 md:right-4" aria-label="Next">
        <ChevronRight size={26} />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'bg-amber-400 w-8' : 'bg-white/50 w-2 hover:bg-white/80'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
