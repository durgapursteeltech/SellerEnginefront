import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Info, Loader2, AlertCircle } from 'lucide-react'
import BidInfoModal from './BidInfoModal'
import { apiClient } from '../utils/api'

interface Bid {
  _id: string
  bidId: number
  dealerId: {
    _id: string
    userName: string
    email: string
    phoneNumber: string
  }
  sellerId: string
  sellerInfo?: {
    name: string
    email: string
    sellerId: string
  }
  categoryId: {
    _id: string
    name: string
    type: string
    parentCategory?: string
  }
  biddingPrice: number
  biddingQuantity: number
  flashedRate: number
  remarks: string
  status: 'Created' | 'Accepted' | 'Rejected'
  expiryTime: string
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  rejectedAt?: string
}

interface BidTableProps {
  refreshTrigger?: number
}

export default function BidsTable({ refreshTrigger }: BidTableProps) {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [isBidInfoModalOpen, setIsBidInfoModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sellerFilter, setSellerFilter] = useState('All')
  const [dealerFilter, setDealerFilter] = useState('All')

  // Get unique sellers and dealers for filter dropdowns
  const uniqueSellers = Array.from(new Set(bids.map(bid => bid.sellerInfo?.name || bid.sellerId).filter(Boolean)))
  const uniqueDealers = Array.from(new Set(bids.map(bid => bid.dealerId?.userName).filter(Boolean)))

  const fetchBids = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to use admin route first, fallback to regular route
      let response
      try {
        response = await apiClient.adminGetAllBids()
      } catch (adminError) {
        console.log('Admin route failed, trying regular route:', adminError)
        response = await apiClient.getAllBids()
      }
      
      if ((response as any).success && (response as any).data) {
        // Handle both admin and regular API response formats
        const bidsData = Array.isArray((response as any).data) ? (response as any).data : ((response as any).data as any)?.data || []
        setBids(bidsData)
        console.log('Fetched bids:', bidsData)
      } else {
        throw new Error((response as any).message || 'Failed to fetch bids')
      }
    } catch (err) {
      console.error('Error fetching bids:', err)
      setError(err instanceof Error ? err.message : 'Failed to load bids')
      setBids([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBids()
  }, [refreshTrigger])

  const handleBidInfo = (bid: Bid) => {
    setSelectedBid(bid)
    setIsBidInfoModalOpen(true)
  }

  const handleStatusUpdate = async (bidId: string, status: 'Accepted' | 'Rejected') => {
    try {
      const response = await apiClient.adminUpdateBidStatus(bidId, status)
      // Refresh the bids list
      await fetchBids()
      console.log(`Bid ${status.toLowerCase()} successfully`)
    } catch (err) {
      console.error(`Error ${status.toLowerCase()}ing bid:`, err)
      alert(`Failed to ${status.toLowerCase()} bid: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Filter bids based on search and filters
  const filteredBids = bids.filter(bid => {
    const matchesSearch = searchTerm === '' || 
      bid.bidId.toString().includes(searchTerm) ||
      bid.dealerId?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.sellerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.sellerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.categoryId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || bid.status === statusFilter
    const matchesSeller = sellerFilter === 'All' || (bid.sellerInfo?.name || bid.sellerId) === sellerFilter
    const matchesDealer = dealerFilter === 'All' || bid.dealerId?.userName === dealerFilter
    
    return matchesSearch && matchesStatus && matchesSeller && matchesDealer
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
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Created':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading bids...</span>
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
            onClick={fetchBids}
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
            Bids ({filteredBids.length})
          </h2>
          <button 
            onClick={fetchBids}
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
              placeholder="Search Bids"
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
                <option value="Created">Created</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Sellers Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sellers</label>
            <div className="relative">
              <select 
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="All">All</option>
                {uniqueSellers.map(seller => (
                  <option key={seller} value={seller}>{seller}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Dealers Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Dealers</label>
            <div className="relative">
              <select 
                value={dealerFilter}
                onChange={(e) => setDealerFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="All">All</option>
                {uniqueDealers.map(dealer => (
                  <option key={dealer} value={dealer}>{dealer}</option>
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
                Bid ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Master Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date and Time
                <ChevronDown className="w-4 h-4 ml-1 inline" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBids.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  {bids.length === 0 ? 'No bids available' : 'No bids match the current filters'}
                </td>
              </tr>
            ) : (
              filteredBids.map((bid) => (
                <tr key={bid._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {bid.bidId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bid.sellerInfo?.name || bid.sellerId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bid.dealerId?.userName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bid.categoryId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bid.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bid.biddingQuantity?.toLocaleString() || '0'} MT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{bid.biddingPrice?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {bid.remarks || 'No comments'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleBidInfo(bid)}
                        className="text-primary-600 hover:text-primary-800 transition-colors p-1"
                        title="Bid Info"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {bid.status === 'Created' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(bid._id, 'Accepted')}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            ✓ Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(bid._id, 'Rejected')}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {bid.status !== 'Created' && (
                        <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(bid.status)}`}>
                          {bid.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bid Info Modal */}
      <BidInfoModal
        isOpen={isBidInfoModalOpen}
        onClose={() => setIsBidInfoModalOpen(false)}
        bidData={selectedBid ? {
          bidId: selectedBid.bidId.toString(),
          sellerName: selectedBid.sellerInfo?.name || selectedBid.sellerId || 'N/A',
          dealerName: selectedBid.dealerId?.userName || 'N/A',
          bidAmount: selectedBid.biddingPrice || 0,
          bidQty: selectedBid.flashedRate || 0,
          masterCategories: selectedBid.categoryId?.name || 'N/A',
          status: selectedBid.status,
          date: formatDate(selectedBid.createdAt)
        } : undefined}
      />
    </div>
  )
} 