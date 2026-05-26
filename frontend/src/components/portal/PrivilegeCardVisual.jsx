import { useState } from 'react'

/** Smart TN Family Privilege Card — uses /gov/privilege-card.png if provided */
export default function PrivilegeCardVisual() {
  const [useCustom, setUseCustom] = useState(true)

  if (useCustom) {
    return (
      <div className="privilege-card-3d">
        <img
          src="/gov/privilege-card.png"
          alt="Smart Family Privilege Card"
          className="w-full max-w-[320px] rounded-xl shadow-2xl border-4 border-amber-400/60"
          onError={() => setUseCustom(false)}
        />
      </div>
    )
  }

  return (
    <div className="privilege-card-3d w-[300px] md:w-[320px]">
      <div className="privilege-card-mock rounded-xl overflow-hidden shadow-2xl border-4 border-amber-400/70">
        <div className="bg-gradient-to-br from-tn-green via-green-800 to-tn-maroon p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-green-200">Government of Tamil Nadu</p>
              <p className="text-xs font-semibold mt-0.5">Smart Family Privilege Card</p>
            </div>
            <img src="/gov/tn-emblem.svg" alt="" className="h-10 w-10 opacity-90" />
          </div>
          <div className="mt-6 bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <p className="text-[9px] text-green-100 uppercase">Family Card ID</p>
            <p className="font-mono text-lg font-bold tracking-wider">TNFP**********</p>
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-green-100">
            <span>AI Eligibility ✓</span>
            <span>Digital TN</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 h-2" />
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-tn-green/10 flex items-center justify-center text-tn-green text-xs font-bold">TVK</div>
          <p className="text-[9px] text-gray-600 leading-tight">
            Valid for all state welfare schemes · Biometric linked
          </p>
        </div>
      </div>
    </div>
  )
}
