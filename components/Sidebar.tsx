'use client'

import { 
  Home, 
  Users, 
  UserCheck, 
  Package, 
  DollarSign, 
  Gavel, 
  ShoppingCart, 
  Truck, 
  MessageCircle, 
  HelpCircle, 
  Settings, 
  LogOut,
  ChevronDown,
  User,
  Shield,
  Edit3,
  GitFork
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'sellers', label: 'Sellers', icon: Users },
  { id: 'seller-users', label: 'Seller Users', icon: UserCheck },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'main-products', label: 'Main Products', icon: Edit3 },
  {id: 'master-categories', label: 'Master Categories', icon: GitFork},
  { id: 'master-rates', label: 'Master Rates', icon: DollarSign },
  { id: 'bids', label: 'Bids', icon: Gavel },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'trucks', label: 'Trucks', icon: Truck },
  { id: 'seller-chats', label: 'Seller Chats', icon: MessageCircle },
  { id: 'support-chat', label: 'Support Chat', icon: HelpCircle },
]

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isSuperAdmin } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-64 bg-sidebar-bg text-white h-screen flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-sidebar-bg font-bold text-sm">D</span>
          </div>
          <div>
            <span className="font-semibold">DGP Seller Admin</span>
            <ChevronDown className="w-4 h-4 inline ml-1" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeItem === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings and Logout */}
      <div className="p-4 border-t border-gray-600">
        <button
          onClick={() => onItemClick('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors mb-2 ${
            activeItem === 'settings'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user ? getInitials(user.name) : 'AD'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
            <div className="flex items-center space-x-1 mt-1">
              {isSuperAdmin() && <Shield className="w-3 h-3 text-yellow-400" />}
              <p className="text-xs text-gray-400 capitalize">
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 