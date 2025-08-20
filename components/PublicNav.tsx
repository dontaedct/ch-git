import Link from "next/link"

export function PublicNav() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Coach Hub
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link
            href="/intake"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/client-portal"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Client Portal
          </Link>
        </nav>
      </div>
    </header>
  )
}
