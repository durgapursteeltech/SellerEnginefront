import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Info, Loader2, AlertCircle } from 'lucide-react'
import TruckInfoModal from './TruckInfoModal'
import { apiClient } from '../utils/api'

interface TruckStatus {
  _id: string
  truckId: string
  dealerId: {
    _id: string
    tradeName: string
    email: string
    phoneNumber: string
  }
  sellerId: {
    _id: string
    brandName: string
    firmName: string
  }
  orderId: string
  status: 'Truck Outside Mill' | 'Truck Inside Mill' | 'Truck on Hold' | 'Truck Dispatched'
  vehicleNumber: string
  vehicleCapacity: number
  driverMobileNo: string
  transporterName?: string
  transporterMobileNo?: string
  transporterGSTNo?: string
  orderDetails?: string
  billDocument?: string[]
  paymentConfirmationDocument?: string[]
  paymentConfirmationText?: string
  quantityToLoad: number
  loadedQuantity: number
  remarks?: string
  reportedBy: 'Dealer' | 'Seller'
  createdAt: string
  updatedAt: string
}

interface TruckTableProps {
  refreshTrigger?: number
}

export default function TrucksTable({ refreshTrigger }: TruckTableProps) {
  const [trucks, setTrucks] = useState<TruckStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTruck, setSelectedTruck] = useState<TruckStatus | null>(null)
  const [isTruckInfoModalOpen, setIsTruckInfoModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Valid truck statuses from the truck model
  const validStatuses = [
    'Truck Outside Mill',
    'Truck Inside Mill',
    'Truck on Hold',
    'Truck Dispatched'
  ]

  // Get unique statuses for filter dropdown (use validStatuses as fallback)
  const uniqueStatuses = trucks.length > 0
    ? Array.from(new Set(trucks.map(truck => truck.status).filter(Boolean)))
    : validStatuses

  const fetchTrucks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to use admin route first, fallback to regular route
      let response
      try {
        response = await apiClient.adminGetAllTruckStatuses()
      } catch (adminError) {
        console.log('Admin route failed, trying regular route:', adminError)
        response = await apiClient.getAllTruckStatuses()
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('🚚 Raw API Response:', response.data)
        console.log('🚚 First truck data:', response.data[0])
        console.log('🚚 First truck status field:', response.data[0]?.status)
        setTrucks(response.data)
        console.log('Fetched truck statuses:', response.data)
      } else {
        throw new Error('Failed to fetch truck statuses')
      }
    } catch (err) {
      console.error('Error fetching truck statuses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load truck statuses')
      setTrucks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrucks()
  }, [refreshTrigger])

  const handleTruckInfo = (truck: TruckStatus) => {
    setSelectedTruck(truck)
    setIsTruckInfoModalOpen(true)
  }

  const handleStatusUpdate = async (truckId: string, newStatus: string) => {
    try {
      const response = await apiClient.adminUpdateTruckStatus(truckId, { truckStatus: newStatus })
      // Refresh the trucks list
      await fetchTrucks()
      console.log('Truck status updated successfully')
    } catch (err) {
      console.error('Error updating truck status:', err)
      alert(`Failed to update truck status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Filter trucks based on search and filters
  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = searchTerm === '' ||
      truck.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.dealerId?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.sellerId?.firmName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || truck.status === statusFilter

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
    switch (status) {
      case 'Truck Dispatched':
        return 'bg-green-100 text-green-800'
      case 'Truck Inside Mill':
        return 'bg-blue-100 text-blue-800'
      case 'Truck Outside Mill':
        return 'bg-yellow-100 text-yellow-800'
      case 'Truck on Hold':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading trucks...</span>
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
            onClick={fetchTrucks}
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
            Trucks ({filteredTrucks.length})
          </h2>
          <button 
            onClick={fetchTrucks}
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
              placeholder="Search Trucks"
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
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Truck Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Truck Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrucks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {trucks.length === 0 ? 'No trucks available' : 'No trucks match the current filters'}
                </td>
              </tr>
            ) : (
              filteredTrucks.map((truck) => (
                <tr key={truck._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{truck.vehicleNumber || 'N/A'}</span>
                      <button
                        onClick={() => handleTruckInfo(truck)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        title="Truck Info"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.truckId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.driverMobileNo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <select
                        value={truck.status}
                        onChange={(e) => handleStatusUpdate(truck._id, e.target.value)}
                        className={`text-xs font-medium rounded px-2 py-1 border-none ${getStatusColor(truck.status)} focus:outline-none`}
                      >
                        <option value="Truck Outside Mill">Truck Outside Mill</option>
                        <option value="Truck Inside Mill">Truck Inside Mill</option>
                        <option value="Truck on Hold">Truck on Hold</option>
                        <option value="Truck Dispatched">Truck Dispatched</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.sellerId?.firmName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.dealerId?.tradeName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleTruckInfo(truck)}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded text-xs font-medium hover:bg-primary-200 transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Truck Info Modal */}
      <TruckInfoModal
        isOpen={isTruckInfoModalOpen}
        onClose={() => setIsTruckInfoModalOpen(false)}
        onSave={fetchTrucks}
        truckData={selectedTruck ? {
          _id: selectedTruck._id,
          truckId: selectedTruck.truckId || 'N/A',
          vehicleNumber: selectedTruck.vehicleNumber || 'N/A',
          orderId: selectedTruck.orderId,
          driverMobileNo: selectedTruck.driverMobileNo || 'N/A',
          sellerName: selectedTruck.sellerId?.firmName || 'N/A',
          dealerName: selectedTruck.dealerId?.tradeName || 'N/A',
          status: selectedTruck.status,
          transporterName: selectedTruck.transporterName,
          transporterMobileNo: selectedTruck.transporterMobileNo,
          transporterGSTNo: selectedTruck.transporterGSTNo,
          vehicleCapacity: selectedTruck.vehicleCapacity,
          quantityToLoad: selectedTruck.quantityToLoad,
          loadedQuantity: selectedTruck.loadedQuantity,
          billDocument: selectedTruck.billDocument,
          paymentConfirmationDocument: selectedTruck.paymentConfirmationDocument,
          remarks: selectedTruck.remarks
        } : undefined}
      />
    </div>
  )
} 