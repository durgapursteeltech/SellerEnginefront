import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronDown, Info, Loader2, AlertCircle } from 'lucide-react'
import UserActivationModal from './UserActivationModal'
import SellerUserInfoModal from './SellerUserInfoModal'
import { apiClient } from '../utils/api'

interface SellerUser {
  _id: string
  userId: string
  name: string
  email: string
  phone?: string
  userType: 'admin' | 'employee'
  status: 'active' | 'inactive' | 'suspended'
  sellerId: string
  isPrimaryAdmin?: boolean
  sellerInfo?: {
    firmName: string
    sellerEmail: string
    phoneNo: string
  }
  permissions?: any
  createdAt: string
  updatedAt: string
}

interface SellerUsersTableProps {
  refreshTrigger?: number
}

export default function SellerUsersTable({ refreshTrigger }: SellerUsersTableProps) {
  
  const [users, setUsers] = useState<SellerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SellerUser | null>(null)
  const [pendingActivation, setPendingActivation] = useState<{ user: SellerUser; isActivating: boolean } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAllSellerUsers()
      
      if (response.status === 'SUCCESS' && response.data) {
        // Handle API response format
        const usersData = (response.data as any)?.users || response.data || []
        setUsers(usersData)
        console.log('Fetched seller users:', usersData)
      } else {
        throw new Error(response.message || 'Failed to fetch seller users')
      }
    } catch (err) {
      console.error('Error fetching seller users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load seller users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [refreshTrigger])

  const handleToggleClick = (user: SellerUser) => {
    setSelectedUser(user)
    setPendingActivation({ user, isActivating: user.status !== 'active' })
    setIsActivationModalOpen(true)
  }

  const handleActivationConfirm = async () => {
    if (pendingActivation) {
      try {
        const newStatus = pendingActivation.isActivating ? 'active' : 'inactive'

        // Use admin endpoint to update seller user status
        const response = await apiClient.updateSellerUserByIdAdmin(pendingActivation.user._id, {
          status: newStatus
        })

        if (response.status === 'SUCCESS') {
          // Update local state
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user._id === pendingActivation.user._id
                ? { ...user, status: newStatus }
                : user
            )
          )
          alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
        } else {
          throw new Error(response.message || 'Failed to update user status')
        }
      } catch (err) {
        console.error('Error updating user status:', err)
        alert(`Failed to update user status: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
    setIsActivationModalOpen(false)
    setPendingActivation(null)
    setSelectedUser(null)
  }

  const handleInfoClick = (user: SellerUser) => {
    setSelectedUser(user)
    setIsUserInfoModalOpen(true)
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sellerInfo?.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && user.status === 'active') ||
      (statusFilter === 'Inactive' && user.status === 'inactive')
    
    const matchesRole = roleFilter === 'All' || 
      (roleFilter === 'Admin' && user.userType === 'admin') ||
      (roleFilter === 'Employee' && user.userType === 'employee')
    
    return matchesSearch && matchesStatus && matchesRole
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading seller users...</span>
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
            onClick={fetchUsers}
            className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with search and filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Seller Users ({filteredUsers.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchUsers}
                className="text-primary-600 hover:text-primary-800 text-sm"
              >
                Refresh
              </button>
              <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
                <Plus className="w-4 h-4" />
                <span>Add user</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
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
            
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Role</label>
              <div className="relative">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="All">All</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active/Inactive
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {users.length === 0 ? 'No seller users found' : 'No users match the current filters'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.sellerInfo?.firmName || user.sellerId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 capitalize">
                          {user.isPrimaryAdmin ? 'Primary Admin' : user.userType}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={user.status === 'active'}
                          onChange={() => handleToggleClick(user)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {user.permissions ? 'Custom' : 'Default'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleInfoClick(user)}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View User Info"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-800 font-medium">
                          Save
                        </button>
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
      <UserActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => {
          setIsActivationModalOpen(false)
          setPendingActivation(null)
          setSelectedUser(null)
        }}
        onConfirm={handleActivationConfirm}
        isActivating={pendingActivation?.isActivating || false}
        userName={selectedUser?.name || ''}
      />

      <SellerUserInfoModal
        isOpen={isUserInfoModalOpen}
        onClose={() => {
          setIsUserInfoModalOpen(false);
          setSelectedUser(null);
        }}
        userData={selectedUser ? {
          _id: selectedUser._id,
          userId: selectedUser.userId,
          name: selectedUser.name,
          sellerName: selectedUser.sellerInfo?.firmName || selectedUser.sellerId || 'N/A',
          email: selectedUser.email,
          role: selectedUser.userType,
          phoneNumber: selectedUser.phone || selectedUser.sellerInfo?.phoneNo || 'N/A',
          userType: selectedUser.userType,
          status: selectedUser.status,
          permissions: selectedUser.permissions,
          sellerInfo: selectedUser.sellerInfo
        } : undefined}
      />
    </>
  )
} 