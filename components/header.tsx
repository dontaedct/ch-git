import Image from "next/image"
import Link from "next/link"

export function Header({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
        <Link href="/sessions" className="flex items-center gap-2">
          <Image
            src="/another-level-logo.png"
            alt="Another Level logo"
            width={28}
            height={28}
            className="rounded-sm border border-gray-200"
          />
          <span className="hidden sm:inline text-sm font-medium tracking-tight text-gray-800">Another Level — Coach Hub</span>
          <span className="sm:hidden text-sm font-medium tracking-tight text-gray-800">Coach Hub</span>
        </Link>
        {!minimal && (
          <nav aria-label="Primary" className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link
              href="/sessions"
              className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              Sessions
            </Link>
            <Link
              href="/intake"
              className="text-sm text-gray-700 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              Intake
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
