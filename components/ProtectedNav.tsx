import Link from "next/link"
import { getClientEnv } from '@lib/env-client'

export function ProtectedNav() {
  const env = getClientEnv();
  
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="hidden sm:inline text-lg font-semibold tracking-tight text-gray-800">
            Coach Hub
          </span>
          <span className="sm:hidden text-lg font-semibold tracking-tight text-gray-800">
            Coach Hub
          </span>
        </Link>
        
        <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/sessions"
            className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
          >
            Sessions
          </Link>
          <Link
            href="/intake"
            className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
          >
            Intake
          </Link>
          <Link
            href="/client-portal"
            className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
          >
            Client Portal
          </Link>
          {env.ENABLE_AI_LIVE && (
            <Link
              href="/ai/live"
              className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
            >
              AI Live
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
