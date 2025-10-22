'use client'

import { X, Users, Clock, Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '../utils/api'

interface OnlineUser {
  userId: string
  userName: string
  userType: string
  lastActivity: string
  lastHeartbeat: string
  loginAt: string
  deviceType: string
}

interface OnlineSeller {
  sellerId: string
  sellerName: string
  onlineUsers: OnlineUser[]
}

interface OnlineSellersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OnlineSellersModal({ isOpen, onClose }: OnlineSellersModalProps) {
  const [onlineSellers, setOnlineSellers] = useState<OnlineSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [totalOnlineUsers, setTotalOnlineUsers] = useState(0)

  const fetchOnlineSellers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getOnlineSellers()

      if ((response.status === 'SUCCESS' || response.success === true) && response.data) {
        setOnlineSellers(response.data.onlineSellers || [])
        setTotalOnlineUsers(response.data.totalOnlineUsers || 0)
      }
    } catch (err) {
      console.error('Error fetching online sellers:', err)
      setOnlineSellers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchOnlineSellers()
      // Auto-refresh every 30 seconds while modal is open
      const interval = setInterval(fetchOnlineSellers, 30000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`

      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatLoginTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Online Sellers</h2>
              <p className="text-sm text-gray-500">
                {totalOnlineUsers} {totalOnlineUsers === 1 ? 'user' : 'users'} online from {onlineSellers.length} {onlineSellers.length === 1 ? 'seller' : 'sellers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
              <p className="text-gray-500">Loading online sellers...</p>
            </div>
          ) : onlineSellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">No sellers currently online</p>
            </div>
          ) : (
            <div className="space-y-6">
              {onlineSellers.map((seller) => (
                <div key={seller.sellerId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Seller Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{seller.sellerName}</h3>
                        <p className="text-sm text-gray-500">
                          {seller.onlineUsers.length} {seller.onlineUsers.length === 1 ? 'user' : 'users'} online
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Online Users */}
                  <div className="space-y-2">
                    {seller.onlineUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="bg-primary-100 p-2 rounded-lg">
                            {getDeviceIcon(user.deviceType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{user.userName}</p>
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {user.userType}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Active {formatTime(user.lastActivity)}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Logged in: {formatLoginTime(user.loginAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 30 seconds</span>
          </div>
          <button
            onClick={fetchOnlineSellers}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  )
}
