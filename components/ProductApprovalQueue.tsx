import { ChevronRight, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '../utils/api'

interface ProductItem {
  _id: string
  name: string
  primaryCategory?: string
  sellerId?: string
  sellerInfo?: {
    firmName: string
    sellerEmail?: string
    phoneNo?: string
  }
  status: string
}

export default function ProductApprovalQueue() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPendingProducts = async () => {
    try {
      setLoading(true)

      // Fetch products with various status formats (lowercase, capitalized, with spaces)
      const [
        draftResponse,
        draftCapResponse,
        pendingResponse,
        pendingApprovalResponse,
        pendingCapResponse
      ] = await Promise.all([
        apiClient.getAllProducts({ status: 'draft', limit: 10 }),
        apiClient.getAllProducts({ status: 'Draft', limit: 10 }),
        apiClient.getAllProducts({ status: 'pending_approval', limit: 10 }),
        apiClient.getAllProducts({ status: 'Pending Approval', limit: 10 }),
        apiClient.getAllProducts({ status: 'Pending', limit: 10 })
      ])

      const allProducts = [
        ...(draftResponse.data?.products || []),
        ...(draftCapResponse.data?.products || []),
        ...(pendingResponse.data?.products || []),
        ...(pendingApprovalResponse.data?.products || []),
        ...(pendingCapResponse.data?.products || [])
      ]

      // Remove duplicates by _id
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p._id === product._id)
      )

      // Sort by creation date (most recent first) and take top 5
      const sortedProducts = uniqueProducts
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setProducts(sortedProducts)
    } catch (err) {
      console.error('Error fetching pending products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingProducts()
  }, [])

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase().replace(/\s+/g, '_')

    if (lowerStatus === 'draft') {
      return 'bg-gray-100 text-gray-800'
    } else if (lowerStatus === 'pending_approval' || lowerStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800'
    } else if (lowerStatus === 'approved') {
      return 'bg-green-100 text-green-800'
    } else if (lowerStatus === 'rejected') {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Product Approval Queue</h2>
          <button
            onClick={fetchPendingProducts}
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
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
                  <p className="text-gray-500 mt-2">Loading pending products...</p>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No pending products found
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.primaryCategory || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sellerInfo?.firmName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
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