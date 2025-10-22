import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Trash2, Info, Loader2, AlertCircle } from 'lucide-react'
import OrderInfoModal from './OrderInfoModal'
import { apiClient } from '../utils/api'

interface Order {
  _id: string
  orderId: string
  stateCode: string
  user: {
    userId: string
    name: string
    email: string
    phone: string
  }
  seller: {
    _id: string
    firmName: string
    sellerEmail: string
  }
  bidId?: {
    _id: string
    bidId: number
  }
  product?: {
    _id: string
    name: string
    category: string
  }
  bidPrice: number
  approvedPrice: number
  quantity: number
  deliveryLocation: string
  deliveryDate: string
  status: string
  truckTracking: string
  dispatchDate?: string
  createdAt: string
  updatedAt: string
  remarks?: string
}

interface OrderTableProps {
  refreshTrigger?: number
}

export default function OrdersTable({ refreshTrigger }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderInfoModalOpen, setIsOrderInfoModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(orders.map(order => order.status).filter(Boolean)))

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to use admin route first, fallback to regular route
      let response
      try {
        response = await apiClient.adminGetAllOrders()
      } catch (adminError) {
        console.log('Admin route failed, trying regular route:', adminError)
        response = await apiClient.getAllOrders()
      }
      
      if ((response as any).success && (response as any).data) {
        // Handle both admin and regular API response formats
        const ordersData = Array.isArray((response as any).data) ? (response as any).data : ((response as any).data as any)?.data || []
        setOrders(ordersData)
        console.log('Fetched orders:', ordersData)
      } else {
        throw new Error((response as any).message || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [refreshTrigger])

  const handleOrderInfo = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderInfoModalOpen(true)
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return
    }

    try {
      const response = await apiClient.adminDeleteOrder(orderId)
      // Refresh the orders list
      await fetchOrders()
      console.log('Order deleted successfully')
    } catch (err) {
      console.error('Error deleting order:', err)
      alert(`Failed to delete order: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order._id)))
    }
  }

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', ' at')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8" />
          <span className="ml-2">{error}</span>
        </div>
        <div className="flex justify-center mt-4">
          <button 
            onClick={fetchOrders}
            className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
          <button 
            onClick={fetchOrders}
            className="text-primary-600 hover:text-primary-800 text-sm"
          >
            Refresh
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Orders"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status</label>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="All">All</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedOrders.size} selected
              </span>
              <button 
                onClick={() => {
                  const promises = Array.from(selectedOrders).map(orderId => handleDeleteOrder(orderId))
                  Promise.all(promises)
                  setSelectedOrders(new Set())
                }}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date and Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  {orders.length === 0 ? 'No orders available' : 'No orders match the current filters'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedOrders.has(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    <div className="flex items-center space-x-2">
                      <span>{order.orderId}</span>
                      <button 
                        onClick={() => handleOrderInfo(order)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        title="Order Info"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.seller?.firmName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.approvedPrice?.toLocaleString() || order.bidPrice?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-red-600 hover:text-red-800 p-1 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Info Modal */}
      <OrderInfoModal
        isOpen={isOrderInfoModalOpen}
        onClose={() => setIsOrderInfoModalOpen(false)}
        orderData={selectedOrder ? {
          orderId: selectedOrder.orderId,
          sellerName: selectedOrder.seller?.firmName || 'N/A',
          dealerName: selectedOrder.user?.name || 'N/A',
          productName: selectedOrder.product?.name || 'Product',
          orderQty: selectedOrder.quantity || 0,
          masterCategories: selectedOrder.product?.category || 'N/A',
          pricePerUnit: selectedOrder.approvedPrice || selectedOrder.bidPrice || 0,
          productType: selectedOrder.product?.category || 'N/A',
          orderStatus: selectedOrder.status,
          truckIds: [] // We'll need to fetch truck data separately for this order
        } : undefined}
      />
    </div>
  )
} 