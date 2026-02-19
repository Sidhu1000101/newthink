import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'INSTRUCTOR'
  createdAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: string
  creator?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    submissions: number
  }
}

export interface Submission {
  id: string
  content?: string
  fileUrl?: string
  plagiarismRisk: number
  feedbackSummary?: string
  score?: number
  status: 'PENDING' | 'EVALUATED'
  createdAt: string
  assignmentId: string
  studentId: string
  assignment?: {
    id: string
    title: string
    description: string
  }
  student?: {
    id: string
    name: string
    email: string
  }
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface PaginatedResponse<T> {
  message: string
  data?: T[]
  [key: string]: any
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'INSTRUCTOR'
  ): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password, role })
    return response.data
  },

  getProfile: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Assignments API
export const assignmentsAPI = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    message: string
    assignments: Assignment[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get('/assignments', { params })
    return response.data
  },

  getById: async (id: string): Promise<{ message: string; assignment: Assignment }> => {
    const response = await api.get(`/assignments/${id}`)
    return response.data
  },

  create: async (data: {
    title: string
    description: string
  }): Promise<{ message: string; assignment: Assignment }> => {
    const response = await api.post('/assignments', data)
    return response.data
  },

  update: async (
    id: string,
    data: { title?: string; description?: string }
  ): Promise<{ message: string; assignment: Assignment }> => {
    const response = await api.put(`/assignments/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/assignments/${id}`)
    return response.data
  },

  getMyAssignments: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    message: string
    assignments: Assignment[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get('/assignments/my/assignments', { params })
    return response.data
  },
}

// Submissions API
export const submissionsAPI = {
  create: async (data: {
    assignmentId: string
    content?: string
    file?: File
  }): Promise<{ message: string; submission: Submission }> => {
    const formData = new FormData()
    formData.append('assignmentId', data.assignmentId)
    if (data.content) {
      formData.append('content', data.content)
    }
    if (data.file) {
      formData.append('file', data.file)
    }

    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getByAssignment: async (
    assignmentId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    message: string
    submissions: Submission[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get(`/submissions/assignment/${assignmentId}`, { params })
    return response.data
  },

  getById: async (id: string): Promise<{ message: string; submission: Submission }> => {
    const response = await api.get(`/submissions/${id}`)
    return response.data
  },

  updateScore: async (
    id: string,
    data: { score: number; feedbackSummary?: string }
  ): Promise<{ message: string; submission: Submission }> => {
    const response = await api.patch(`/submissions/${id}/score`, data)
    return response.data
  },

  getMySubmissions: async (params?: {
    page?: number
    limit?: number
    status?: 'PENDING' | 'EVALUATED'
  }): Promise<{
    message: string
    submissions: Submission[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get('/submissions/my', { params })
    return response.data
  },
}

export default api
