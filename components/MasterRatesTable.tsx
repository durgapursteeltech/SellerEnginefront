import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronDown, Edit, Loader2, AlertCircle } from 'lucide-react'
import AddMasterRateModal from './AddMasterRateModal'
import { apiClient } from '../utils/api'

interface MasterRate {
  _id: string
  sellerId: string
  sellerInfo?: {
    firmName: string
    sellerEmail: string
    phoneNo: string
  }
  masterCategory: string
  productName?: string
  masterRate: number
  loadingRate: number
  autoRejectMargin: number
  differenceRate?: number
  status: 'created' | 'suspended'
  createdAt: string
  updatedAt: string
}

interface MasterRatesTableProps {
  refreshTrigger?: number
}

export default function MasterRatesTable({ refreshTrigger }: MasterRatesTableProps) {

  const [rates, setRates] = useState<MasterRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddMasterRateModalOpen, setIsAddMasterRateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sellerFilter, setSellerFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Get unique sellers and categories for filter dropdowns
  const uniqueSellers = Array.from(new Set(rates.map(rate => rate.sellerInfo?.firmName || rate.sellerId).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(rates.map(rate => rate.masterCategory).filter(Boolean)))

  const fetchMasterRates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAllMasterRates()
      
      if (response.status === 'SUCCESS' && response.data) {
        setRates(response.data.rates || [])
        console.log('Fetched master rates:', response.data.rates)
      } else {
        throw new Error(response.message || 'Failed to fetch master rates')
      }
    } catch (err) {
      console.error('Error fetching master rates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load master rates')
      setRates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMasterRates()
  }, [refreshTrigger])

  const handleAddMasterRate = () => {
    setIsAddMasterRateModalOpen(true)
  }

  // Filter rates based on search and filters
  const filteredRates = rates.filter(rate => {
    
    const matchesSearch = searchTerm === '' || 
      rate.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.masterCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.sellerInfo?.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && rate.status === 'created') ||
      (statusFilter === 'Inactive' && rate.status === 'suspended')
    
    const matchesSeller = sellerFilter === 'All' || 
      (rate.sellerInfo?.firmName || rate.sellerId) === sellerFilter
    
    const matchesCategory = categoryFilter === 'All' || rate.masterCategory === categoryFilter
    
    return matchesSearch && matchesStatus && matchesSeller && matchesCategory
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading master rates...</span>
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
            onClick={fetchMasterRates}
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
            Master Rates ({filteredRates.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchMasterRates}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Refresh
            </button>
            <button 
              onClick={handleAddMasterRate}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Category Rate</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rates..."
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Master Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Master Rate(per unit)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loading Rate(per ton)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Auto Reject Margin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {rates.length === 0 ? 'No master rates found' : 'No rates match the current filters'}
                </td>
              </tr>
            ) : (
              filteredRates.map((rate) => (
                <tr key={rate._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rate.sellerInfo?.firmName || rate.sellerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rate.masterCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{rate.masterRate?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{rate.loadingRate?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{rate.autoRejectMargin?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={rate.status === 'created'}
                        readOnly
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-primary-600 hover:text-primary-800 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Master Rate Modal */}
      {/* <AddMasterRateModal
        isOpen={isAddMasterRateModalOpen}
        onClose={() => setIsAddMasterRateModalOpen(false)}
      /> */}
    </div>
  )
} 