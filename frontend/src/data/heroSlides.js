/** Hero carousel — place images in public/hero/ or uses fallbacks */
const fallbacks = [
  'https://images.unsplash.com/photo-1593113598332-cd288d64905e?w=1920&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80',
]

export const heroSlides = [
  {
    id: 1,
    image: '/hero/family-card.png',
    fallback: fallbacks[0],
    titleEn: 'Government of Tamil Nadu',
    titleHighlightEn: 'Smart Family Privilege Card',
    titleTa: 'தமிழ்நாடு அரசு',
    titleHighlightTa: 'ஸ்மார்ட் குடும்ப சிறப்பு அட்டை',
    descEn: 'One unified digital card for every family — welfare schemes reach you automatically through AI.',
    descTa: 'ஒவ்வொரு குடும்பத்திற்கும் ஒரே டிஜிட்டல் அட்டை — AI மூலம் நலத்திட்டங்கள் உங்களை தானாகவே அடையும்.',
    ctaEn: 'Register Your Family',
    ctaTa: 'குடும்பத்தை பதிவு செய்யுங்கள்',
    ctaLink: '/register',
  },
  {
    id: 2,
    image: '/hero/slide2.jpg',
    fallback: fallbacks[1],
    titleEn: 'Chief Minister\'s Vision',
    titleHighlightEn: 'AI Welfare Delivery',
    titleTa: 'முதலமைச்சர் பார்வை',
    titleHighlightTa: 'AI நல விநியோகம்',
    descEn: 'Introduced under the Hon\'ble Chief Minister — transparent, corruption-free benefit tracking.',
    descTa: 'மாண்புமிகு முதலமைச்சர் அவர்களால் — வெளிப்படையான, ஊழல் இல்லாத பயன் கண்காணிப்பு.',
    ctaEn: 'Sign In',
    ctaTa: 'உள்நுழை',
    ctaLink: '/login',
  },
  {
    id: 3,
    image: '/hero/slide3.jpg',
    fallback: fallbacks[2],
    titleEn: 'TVK · Tamil Nadu',
    titleHighlightEn: 'Digital Governance',
    titleTa: 'TVK · தமிழ்நாடு',
    titleHighlightTa: 'டிஜிட்டல் ஆளுமை',
    descEn: 'From registration to benefit credit — complete transparency on one official portal.',
    descTa: 'பதிவு முதல் பயன் வரை — ஒரே அதிகாரப்பூர்வ வாயிலில் முழு வெளிப்படைத்தன்மை.',
    ctaEn: 'Learn More',
    ctaTa: 'மேலும் அறிய',
    ctaLink: '/login',
  },
]

export const loginBgImages = heroSlides.map((s) => s.fallback)
