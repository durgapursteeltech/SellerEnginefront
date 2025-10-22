'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { API_BASE_URL } from '@/utils/api'

interface AdminUser {
  userId: string
  name: string
  email: string
  role: 'superadmin' | 'admin'
  permissions: string[]
  lastLogin?: string
}

interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AdminUser; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: AdminUser }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  updateUser: (user: AdminUser) => void
  hasPermission: (permission: string) => boolean
  isSuperAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for stored auth token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const userStr = localStorage.getItem('adminUser')
        
        if (token && userStr) {
          const user = JSON.parse(userStr)
          
          // Validate token by making a request to get profile
          const response = await fetch(`${API_BASE_URL}/admin/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: data.data.user, token }
            })
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            dispatch({ type: 'LOGOUT' })
          }
        } else {
          dispatch({ type: 'LOGOUT' })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        dispatch({ type: 'LOGOUT' })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      // Import apiClient dynamically to avoid circular dependency
      const { apiClient } = await import('@/utils/api')
      const response = await apiClient.adminLogin(email, password)

      // Store auth data
      if (response.data) {
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.user))

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              ...response.data.user,
              role: (response.data.user.role as 'superadmin' | 'admin') || 'admin'
            },
            token: response.data.token
          }
        })
      } else {
        throw new Error('Invalid response data')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    dispatch({ type: 'LOGOUT' })
    
    // Optional: Call logout endpoint
    if (state.token) {
      fetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      }).catch(console.error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const updateUser = (user: AdminUser) => {
    localStorage.setItem('adminUser', JSON.stringify(user))
    dispatch({ type: 'UPDATE_USER', payload: user })
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'superadmin') return true
    return state.user.permissions?.includes(permission) || false
  }

  const isSuperAdmin = (): boolean => {
    return state.user?.role === 'superadmin' || false
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    updateUser,
    hasPermission,
    isSuperAdmin,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
