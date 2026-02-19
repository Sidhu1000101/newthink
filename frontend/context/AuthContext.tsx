'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

// Types
interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'INSTRUCTOR'
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: 'STUDENT' | 'INSTRUCTOR') => Promise<void>
  logout: () => void
  loading: boolean
}

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [loading, setLoading] = React.useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          const user = JSON.parse(userStr)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const response = await authAPI.login(email, password)
      
      // Store in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      })
      
      toast.success('Login successful!')
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' })
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'INSTRUCTOR'
  ) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const response = await authAPI.register(name, email, password, role)
      
      // Store in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      })
      
      toast.success('Registration successful!')
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' })
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
