'use client'

import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { logout, user } = useAuth()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
          <Shield className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Access Denied
        </h1>
        
        <p className="mt-4 text-lg text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
        
        {user && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Current User:</strong> {user.name} ({user.email})
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        )}
        
        <div className="mt-8 space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="mt-8">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
