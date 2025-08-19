import Link from 'next/link';
import { Button } from '@ui/button';

interface ProtectedNavProps {
  userRole?: 'client' | 'coach';
  userName?: string;
}

export function ProtectedNav({ userRole, userName }: ProtectedNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Coach Hub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {userRole === 'client' && (
              <>
                <Link href="/client-portal" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/weekly-plans" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Weekly Plans
                </Link>
                <Link href="/check-in" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Check In
                </Link>
              </>
            )}
            {userRole === 'coach' && (
              <>
                <Link href="/sessions" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sessions
                </Link>
                <Link href="/clients" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Clients
                </Link>
                <Link href="/trainer-profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {userName && (
              <span className="text-sm text-gray-600">
                Welcome, {userName}
              </span>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
