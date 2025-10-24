import { ChevronRight, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '../utils/api'

interface ActivityItem {
  _id: string
  sellerId: string
  sellerName?: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      // Use new comprehensive activity log endpoint
      const response = await apiClient.getRecentActivitiesNew(20)

      if ((response.status === 'SUCCESS' || response.success === true) && response.data) {
        setActivities(response.data.activities || [])
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product_added':
        return 'bg-green-100 text-green-800'
      case 'product_approved':
        return 'bg-emerald-100 text-emerald-800'
      case 'product_rejected':
        return 'bg-red-100 text-red-800'
      case 'product_difference_changed':
        return 'bg-cyan-100 text-cyan-800'
      case 'rate_opened':
        return 'bg-indigo-100 text-indigo-800'
      case 'bid_received':
        return 'bg-yellow-100 text-yellow-800'
      case 'bid_accepted':
        return 'bg-green-100 text-green-800'
      case 'bid_rejected':
        return 'bg-red-100 text-red-800'
      case 'order_created':
        return 'bg-orange-100 text-orange-800'
      case 'truck_placed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button 
            onClick={fetchRecentActivity}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
                  <p className="text-gray-500 mt-2">Loading recent activity...</p>
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No recent activity found
                </td>
              </tr>
            ) : (
              activities.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.sellerName || 'Unknown Seller'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                      {formatType(item.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 