import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronDown, Info, Loader2, AlertCircle } from 'lucide-react'
import ProductInfoModal from './ProductInfoModal'
import AddProductModal from './AddProductModal'
import { apiClient } from '../utils/api'

interface Product {
  _id: string
  name: string
  description?: string
  primaryCategory: string
  sellerId: string
  sellerInfo?: {
    firmName: string
    sellerEmail: string
    phoneNo: string
  }
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'disabled'
  createdAt: string
  updatedAt: string
  specifications?: any
  imageUrl?: string
  grade?: string
  size?: string
}

interface ProductsTableProps {
  refreshTrigger?: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'draft':
      return 'bg-blue-100 text-blue-800'
    case 'disabled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ProductsTable({ refreshTrigger }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sellerFilter, setSellerFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [productDifferences, setProductDifferences] = useState<Record<string, number>>({})
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Get unique sellers and categories for filter dropdowns
  const uniqueSellers = Array.from(new Set(products.map(product => product.sellerInfo?.firmName || product.sellerId).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(products.map(product => product.primaryCategory).filter(Boolean)))

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getAllProducts()

      if (response.status === 'SUCCESS' && response.data) {
        const fetchedProducts = response.data.products || []
        setProducts(fetchedProducts)
        console.log('Fetched products:', fetchedProducts)
        console.log('First product imageUrl:', fetchedProducts[0]?.imageUrl)

        // Fetch product differences for all products
        await fetchProductDifferences(fetchedProducts)
      } else {
        throw new Error(response.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProductDifferences = async (products: Product[]) => {
    try {
      // Fetch product differences for all products
      const differenceMap: Record<string, number> = {}

      // Make API calls for each product to get their difference rate
      await Promise.all(
        products.map(async (product) => {
          try {
            const response = await apiClient.getProductDifferenceByProductId(product._id)
            if (response.success && response.data) {
              const differenceData = response.data as { differenceRate?: number }
              differenceMap[product._id] = differenceData.differenceRate || 0
            } else {
              // No difference rate set for this product
              differenceMap[product._id] = 0
            }
          } catch (error: any) {
            // Only log unexpected errors, not 404s (which are normal when no difference is set)
            const isNotFoundError = error?.message?.includes('not found') || error?.message?.includes('404')
            if (!isNotFoundError) {
              console.error(`Error fetching difference for product ${product._id}:`, error)
            }
            // Set to 0 if there's no difference or error (404 means no difference set)
            differenceMap[product._id] = 0
          }
        })
      )

      setProductDifferences(differenceMap)
      console.log('Product differences fetched:', differenceMap)
    } catch (error) {
      console.error('Error fetching product differences:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  const handleProductInfo = (product: Product) => {
    setSelectedProduct(product)
    setIsProductInfoModalOpen(true)
  }

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true)
  }

  const handleStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.updateProductStatus(productId, status)
      // Refresh the products list
      await fetchProducts()
      console.log(`Product ${status} successfully`)
    } catch (err) {
      console.error(`Error ${status}ing product:`, err)
      alert(`Failed to ${status} product: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allProductIds = filteredProducts.map(p => p._id)
      setSelectedProducts(allProductIds)
    } else {
      setSelectedProducts([])
    }
  }

  // Handle individual product selection
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to approve')
      return
    }

    if (!confirm(`Are you sure you want to approve ${selectedProducts.length} product(s)?`)) {
      return
    }

    try {
      setBulkActionLoading(true)

      // Update each product status
      await Promise.all(
        selectedProducts.map(productId =>
          apiClient.updateProductStatus(productId, 'approved')
        )
      )

      alert(`Successfully approved ${selectedProducts.length} product(s)`)
      setSelectedProducts([])
      await fetchProducts()
    } catch (err) {
      console.error('Error bulk approving products:', err)
      alert(`Failed to approve products: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to reject')
      return
    }

    if (!confirm(`Are you sure you want to reject ${selectedProducts.length} product(s)?`)) {
      return
    }

    try {
      setBulkActionLoading(true)

      // Update each product status
      await Promise.all(
        selectedProducts.map(productId =>
          apiClient.updateProductStatus(productId, 'rejected')
        )
      )

      alert(`Successfully rejected ${selectedProducts.length} product(s)`)
      setSelectedProducts([])
      await fetchProducts()
    } catch (err) {
      console.error('Error bulk rejecting products:', err)
      alert(`Failed to reject products: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sellerInfo?.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Draft' && product.status === 'draft') ||
      (statusFilter === 'Pending Approval' && product.status === 'pending_approval') ||
      (statusFilter === 'Approved' && product.status === 'approved') ||
      (statusFilter === 'Rejected' && product.status === 'rejected') ||
      (statusFilter === 'Disabled' && product.status === 'disabled')
    
    const matchesSeller = sellerFilter === 'All' || 
      (product.sellerInfo?.firmName || product.sellerId) === sellerFilter
    
    const matchesCategory = categoryFilter === 'All' || product.primaryCategory === categoryFilter
    
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
          <span className="ml-2 text-gray-600">Loading products...</span>
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
            onClick={fetchProducts}
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
            Products ({filteredProducts.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchProducts}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Refresh
            </button>

            {/* Bulk Action Buttons */}
            {selectedProducts.length > 0 && (
              <>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>✓</span>
                  )}
                  <span>Approve ({selectedProducts.length})</span>
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>✗</span>
                  )}
                  <span>Reject ({selectedProducts.length})</span>
                </button>
              </>
            )}

            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
          
          {/* Seller Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Seller</label>
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
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Disabled">Disabled</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Last Active Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Last Active</label>
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600">
                <option>All</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Master Categories Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Categories</label>
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="All">All</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
                <input
                  type="checkbox"
                  className="rounded border-gray-300 cursor-pointer"
                  checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Master Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difference Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modify Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Modified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  {products.length === 0 ? 'No products found' : 'No products match the current filters'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.primaryCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sellerInfo?.firmName || product.sellerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{productDifferences[product._id] !== undefined ? productDifferences[product._id] : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.status === 'pending_approval' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(product._id, 'approved')}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(product._id, 'rejected')}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleProductInfo(product)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                        title="Product Info"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Info Modal */}
      <ProductInfoModal
        isOpen={isProductInfoModalOpen}
        onClose={() => setIsProductInfoModalOpen(false)}
        productId={selectedProduct?._id}
        productData={selectedProduct ? {
          productName: selectedProduct.name,
          sellerName: selectedProduct.sellerInfo?.firmName || selectedProduct.sellerId,
          masterCategories: selectedProduct.primaryCategory,
          differenceRate: productDifferences[selectedProduct._id] || 0, // Fetch from database
          productDescription: selectedProduct.description || '',
          status: selectedProduct.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          imageUrl: selectedProduct.imageUrl || ''
        } : undefined}
        onSave={fetchProducts}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
    </div>
  )
} 