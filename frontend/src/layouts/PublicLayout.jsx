import PortalHeader from '../components/portal/PortalHeader'
import GovTopBar from '../components/portal/GovTopBar'

export default function PublicLayout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <GovTopBar />
      <PortalHeader />
      <main className={fullWidth ? 'flex-1' : 'flex-1 max-w-7xl w-full mx-auto px-4 py-8'}>
        {children}
      </main>
      <footer className="gov-footer text-white">
        <div className="gov-tricolor-thin" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/gov/tn-emblem.png" alt="" className="h-12 w-12" />
              <div>
                <p className="font-bold text-lg">Government of Tamil Nadu</p>
                <p className="text-green-200 text-sm">Smart Family Privilege Card System</p>
              </div>
            </div>
            <p className="text-green-200 text-xs text-center md:text-right max-w-md">
              Official welfare portal · Introduced under Hon&apos;ble Chief Minister&apos;s initiative · TVK Digital Governance
            </p>
          </div>
          <p className="text-center text-green-300/80 text-xs mt-6 border-t border-white/10 pt-4">
            © {new Date().getFullYear()} Government of Tamil Nadu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
