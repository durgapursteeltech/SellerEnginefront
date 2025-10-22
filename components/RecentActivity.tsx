import { ChevronRight, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '../utils/api'

interface ActivityItem {
  _id: string
  actorType: 'seller' | 'seller_user' | 'admin' | 'system'
  actorId: string
  actorName: string
  sellerId?: string
  sellerName?: string
  action: string
  category: string
  description: string
  createdAt: string
  priority: 'low' | 'medium' | 'high' | 'critical'
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'authentication':
        return 'bg-blue-100 text-blue-800'
      case 'user_management':
        return 'bg-purple-100 text-purple-800'
      case 'product':
        return 'bg-green-100 text-green-800'
      case 'order':
        return 'bg-orange-100 text-orange-800'
      case 'bid':
        return 'bg-yellow-100 text-yellow-800'
      case 'rate':
        return 'bg-indigo-100 text-indigo-800'
      case 'support':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
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
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                    <div className="font-medium text-gray-900">{formatAction(item.action)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      by {item.actorName} {item.sellerName && `(${item.sellerName})`}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
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