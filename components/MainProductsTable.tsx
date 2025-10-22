import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronDown, Edit2, Loader2, AlertCircle, Check, X } from 'lucide-react'
import { apiClient } from '../utils/api'

interface MainProduct {
  _id: string
  name: string
  price: number[]
  category: 'TMT' | 'ANGLE'
  saleOpen: 'Yes' | 'No'
  IncOrDec: string[]
  createdAt: string
}

interface MainProductsTableProps {
  refreshTrigger?: number
}

export default function MainProductsTable({ refreshTrigger }: MainProductsTableProps) {
  const [products, setProducts] = useState<MainProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MainProduct>>({})
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAllMainProducts()
      
      if (response.status === 'SUCCESS' && response.data?.success && response.data?.products) {
        setProducts(response.data.products)
        console.log('Fetched main products:', response.data.products)
      } else {
        throw new Error(response.message || 'Failed to fetch main products')
      }
    } catch (err) {
      console.error('Error fetching main products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load main products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  const handleEdit = (product: MainProduct) => {
    setEditingProduct(product._id)
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      saleOpen: product.saleOpen
    })
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editingProduct) return

    try {
      setSaving(true)
      await apiClient.updateMainProduct(editingProduct, editForm)
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === editingProduct 
            ? { ...p, ...editForm } as MainProduct
            : p
        )
      )
      
      setEditingProduct(null)
      setEditForm({})
      
      // Show success message
      alert('Product updated successfully! Changes will be reflected in the seller app.')
    } catch (err) {
      console.error('Error updating product:', err)
      alert(`Failed to update product: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
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

  const getSaleOpenColor = (saleOpen: string) => {
    return saleOpen === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading main products...</span>
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Main Price Products ({filteredProducts.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage TMT/ANGLE products that appear in seller app rates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchProducts}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Refresh
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
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Category</label>
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="All">All</option>
                <option value="TMT">TMT</option>
                <option value="ANGLE">ANGLE</option>
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
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Open
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
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {products.length === 0 ? 'No main products found' : 'No products match the current filters'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {editingProduct === product._id ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        autoFocus
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingProduct === product._id ? (
                      <select
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value as 'TMT' | 'ANGLE'})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="TMT">TMT</option>
                        <option value="ANGLE">ANGLE</option>
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingProduct === product._id ? (
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={editForm.price?.[0] || ''}
                          onChange={(e) => setEditForm({...editForm, price: [parseFloat(e.target.value) || 0, editForm.price?.[1] || 0]})}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          placeholder="Min"
                        />
                        <span className="self-center">-</span>
                        <input
                          type="number"
                          value={editForm.price?.[1] || ''}
                          onChange={(e) => setEditForm({...editForm, price: [editForm.price?.[0] || 0, parseFloat(e.target.value) || 0]})}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          placeholder="Max"
                        />
                      </div>
                    ) : (
                      `₹${product.price[0].toLocaleString()} - ₹${product.price[1].toLocaleString()}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProduct === product._id ? (
                      <select
                        value={editForm.saleOpen || ''}
                        onChange={(e) => setEditForm({...editForm, saleOpen: e.target.value as 'Yes' | 'No'})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSaleOpenColor(product.saleOpen)}`}>
                        {product.saleOpen}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProduct === product._id ? (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handleSave}
                          disabled={saving}
                          className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                          title="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-800 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
