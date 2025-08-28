'use client'

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"

export function Header({ minimal = false }: { minimal?: boolean }) {
  const { user, loading, signOut } = useAuth()

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/another-level-logo.png"
            alt="Your Organization logo"
            width={28}
            height={28}
            className="rounded-sm border border-gray-200"
          />
          <span className="hidden sm:inline text-sm font-medium tracking-tight text-gray-800">Your Organization — Micro App</span>
          <span className="sm:hidden text-sm font-medium tracking-tight text-gray-800">Micro App</span>
        </Link>
        {!minimal && (
          <nav aria-label="Primary" className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/consultation"
              className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              Consultation
            </Link>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
