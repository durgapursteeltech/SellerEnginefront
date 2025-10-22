import React, { useState, useEffect } from 'react'
import { Filter, MessageCircle, Info, FileText } from 'lucide-react'
import SellerInfoModal from './SellerInfoModal'
import GSTCertificateModal from './GSTCertificateModal'
import { apiClient } from '../utils/api'

interface DealerItem {
  sellerId: string
  sellerName: string
  status: 'Pending' | 'Approved' | 'Rejected'
  registrationDate: string
  masterCategory: string
  email: string
  phone: string
  gstin: string
  bankName: string
  accountNumber: string
  ifsc: string
  address: string
  city: string
  zipcode: string
}

export default function DealerPortalTable() {

  const [isSellerInfoModalOpen, setIsSellerInfoModalOpen] = useState(false)
  const [isGSTModalOpen, setIsGSTModalOpen] = useState(false)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<DealerItem | null>(null)
  const [selectedSellerCategories, setSelectedSellerCategories] = useState<string[]>([])
  const [selectedSellerName, setSelectedSellerName] = useState<string>('')
  const [sellers, setSellers] = useState<DealerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [masterCategories, setMasterCategories] = useState<any[]>([])

  // Load sellers from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const categories = await loadMasterCategories();
    await loadSellers(categories);
  };

  const loadMasterCategories = async (): Promise<any[]> => {
    console.log('🔵 Starting loadMasterCategories...');
    try {
      const response = await apiClient.getAllMasterCategories();
      console.log('🟢 Master Categories Response:', response);
      console.log('🟢 Response status:', response?.status);
      console.log('🟢 Response data:', response?.data);

      if (response.status === 'SUCCESS' && response.data) {
        console.log('✅ Setting Master Categories Data:', response.data);
        setMasterCategories(response.data);
        return response.data;
      } else {
        console.warn('⚠️ Response status is not SUCCESS or data is missing');
        console.warn('⚠️ Status:', response?.status, 'Data:', response?.data);
        setMasterCategories([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading master categories:', error);
      setMasterCategories([]);
      return [];
    } finally {
      console.log('🔵 Finished loadMasterCategories');
    }
  };

  const getCategoryNameForSeller = (sellerId: string, categories: any[]): string => {
    console.log('Looking for categories for seller:', sellerId, 'in categories:', categories);

    // Find ALL categories that include this seller ID
    const matchedCategories = categories.filter((cat: any) =>
      cat.sellerIds && cat.sellerIds.includes(sellerId)
    );

    console.log('Found categories:', matchedCategories);

    // Return all category names joined by comma
    if (matchedCategories.length > 0) {
      const categoryNames = matchedCategories.map((cat: any) => cat.name).join(', ');
      console.log('Category names for seller:', categoryNames);
      return categoryNames;
    }

    return '';
  };

  const loadSellers = async (categories: any[] = []) => {
    console.log('🔵 Starting loadSellers with categories:', categories);
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAllSellers();

      if (response.status === 'SUCCESS' && response.data?.sellers) {
        // Transform API data to match our interface
        const transformedSellers: DealerItem[] = response.data.sellers.map((seller: any) => ({
          sellerId: seller.sellerId,
          sellerName: seller.firmName || seller.companyName || 'Unknown Company',
          status: (seller.status === 'active' ? 'Approved' :
                  seller.status === 'pending' ? 'Pending' : 'Rejected') as 'Pending' | 'Approved' | 'Rejected',
          registrationDate: new Date(seller.createdAt).toLocaleDateString('en-GB'),
          masterCategory: getCategoryNameForSeller(seller.sellerId, categories) || seller.category || '',
          email: seller.sellerEmail || seller.email || '',
          phone: seller.phoneNo || seller.phone || '',
          gstin: seller.gstNo || seller.gstin || '',
          bankName: seller.bankName || '',
          accountNumber: seller.accountNumber || '',
          ifsc: seller.ifsc || '',
          address: seller.address || '',
          city: seller.city || '',
          zipcode: seller.pincode || seller.zipCode || ''
        }));
        setSellers(transformedSellers);
      } else {
        setError('Failed to load sellers from server');
        setSellers([]);
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
      setError('Failed to connect to server. Please check your connection.');
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoClick = (seller: DealerItem) => {
    setSelectedSeller(seller)
    setIsSellerInfoModalOpen(true)
  }

  const handleGSTClick = (seller: DealerItem) => {
    setSelectedSeller(seller)
    setIsGSTModalOpen(true)
  }

  const handleCategoriesClick = (seller: DealerItem) => {
    const categories = seller.masterCategory ? seller.masterCategory.split(', ').filter(Boolean) : []
    setSelectedSellerCategories(categories)
    setSelectedSellerName(seller.sellerName)
    setIsCategoriesModalOpen(true)
  }

  const handleApprove = async (seller: DealerItem) => {
    if (!confirm(`Are you sure you want to approve ${seller.sellerName}?`)) {
      return;
    }

    try {
      setLoading(true)
      
      // TODO: Get admin user info from auth context
      const approvedBy = 'Admin User' // Replace with actual admin info
      
      await apiClient.approveSeller(seller.sellerId, approvedBy)
      
      setSellers(prevSellers => 
        prevSellers.map(s => 
          s.sellerId === seller.sellerId 
            ? { ...s, status: 'Approved' as const }
            : s
        )
      )
      
      alert(`${seller.sellerName} has been approved successfully!`)
    } catch (error) {
      console.error('Error approving seller:', error)
      alert('Failed to approve seller. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (seller: DealerItem) => {
    const reason = prompt(`Please enter rejection reason for ${seller.sellerName}:`)
    if (!reason) {
      return;
    }

    try {
      setLoading(true)
      
      // TODO: Get admin user info from auth context
      const rejectedBy = 'Admin User' // Replace with actual admin info
      
      await apiClient.rejectSeller(seller.sellerId, rejectedBy, reason)
      
      setSellers(prevSellers => 
        prevSellers.map(s => 
          s.sellerId === seller.sellerId 
            ? { ...s, status: 'Rejected' as const }
            : s
        )
      )
      
      alert(`${seller.sellerName} has been rejected.`)
    } catch (error) {
      console.error('Error rejecting seller:', error)
      alert('Failed to reject seller. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Dealer Portal</h2>
            <button
              onClick={() => loadSellers(masterCategories)}
              disabled={loading}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            
            {/* Test API Connection Button */}
            <button
              onClick={async () => {
                try {
                  console.log('Testing API connection...');
                  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'https://dst-engine-uat.onrender.com');
                  
                  // Test basic fetch first
                  const testUrl = 'https://dst-engine-uat.onrender.com/api/seller/sellers/admin/all';
                  console.log('Test URL:', testUrl);
                  
                  const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  console.log('Response status:', response.status);
                  console.log('Response OK:', response.ok);
                  
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  if (response.ok) {
                    alert(`API Connected! Found ${data.data?.sellers?.length || 0} sellers`);
                  } else {
                    alert(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('API Test Error:', error);
                  alert(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700"
            >
              Test API
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Master Categories</label>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>All</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Status</label>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>All</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Registration Date</label>
              <input 
                type="date" 
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
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
                  Seller Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modify Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Master Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-gray-500">Loading sellers...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-red-600">
                      <p className="font-medium">Error loading sellers</p>
                      <p className="text-sm text-gray-500 mt-1">{error}</p>
                      <button
                        onClick={() => loadSellers(masterCategories)}
                        className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="font-medium">No sellers found</p>
                      <p className="text-sm mt-1">No seller registrations are available at the moment.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sellers.map((item, index) => (
                  <tr key={item.sellerId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {item.sellerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.registrationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'Pending' ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleApprove(item)}
                            disabled={loading}
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs hover:bg-green-200 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(item)}
                            disabled={loading}
                            className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : item.status === 'Approved' ? (
                        <div className="flex space-x-2">
                          <span className="text-sm text-green-600 font-medium">Approved</span>
                          <button 
                            onClick={() => handleReject(item)}
                            disabled={loading}
                            className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                            title="Reject approved seller"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Rejected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(() => {
                        if (!item.masterCategory) return 'N/A';

                        const categories = item.masterCategory.split(', ').filter(Boolean);

                        if (categories.length === 0) return 'N/A';
                        if (categories.length <= 2) return item.masterCategory;

                        // Show first 2 categories + "more" button
                        return (
                          <div className="flex flex-wrap items-center gap-1">
                            <span>{categories.slice(0, 2).join(', ')}</span>
                            <button
                              onClick={() => handleCategoriesClick(item)}
                              className="text-primary-600 hover:text-primary-800 text-xs font-medium underline ml-1"
                            >
                              +{categories.length - 2} more
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleInfoClick(item)}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View Seller Info"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleGSTClick(item)}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View GST Certificate"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-800 p-1">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-500">Chat with Seller</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SellerInfoModal
        isOpen={isSellerInfoModalOpen}
        onClose={() => setIsSellerInfoModalOpen(false)}
        sellerId={selectedSeller?.sellerId}
        sellerData={selectedSeller ? {
          sellerName: selectedSeller.sellerName,
          email: selectedSeller.email,
          phone: selectedSeller.phone,
          gstin: selectedSeller.gstin,
          masterCategories: selectedSeller.masterCategory ? selectedSeller.masterCategory.split(', ') : [],
          bankName: selectedSeller.bankName,
          accountNumber: selectedSeller.accountNumber,
          ifsc: selectedSeller.ifsc,
          address: selectedSeller.address,
          city: selectedSeller.city,
          zipcode: selectedSeller.zipcode
        } : undefined}
        onSave={() => loadSellers(masterCategories)}
      />

      <GSTCertificateModal
        isOpen={isGSTModalOpen}
        onClose={() => setIsGSTModalOpen(false)}
        certificateData={selectedSeller ? {
          gstin: selectedSeller.gstin,
          legalName: selectedSeller.sellerName,
          tradeName: selectedSeller.sellerName,
          address: `${selectedSeller.address}\n${selectedSeller.city}\n${selectedSeller.zipcode}`
        } : undefined}
      />

      {/* Categories Modal */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Master Categories - {selectedSellerName}
                </h3>
                <button
                  onClick={() => setIsCategoriesModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="space-y-2">
                {selectedSellerCategories.length > 0 ? (
                  selectedSellerCategories.map((category, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700"
                    >
                      {category}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No categories assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 