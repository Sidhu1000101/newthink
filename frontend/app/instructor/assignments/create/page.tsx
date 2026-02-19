'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Save,
  FileText,
  AlertCircle
} from 'lucide-react'
import { assignmentsAPI } from '@/services/api'
import Link from 'next/link'

export default function CreateAssignmentPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await assignmentsAPI.create(formData)
      router.push('/instructor/assignments')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create assignment'
      setErrors({ submit: message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user?.role !== 'INSTRUCTOR') {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available to instructors.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/instructor/assignments"
              className="btn btn-outline mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Assignment</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create a new assignment for your students
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`input ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter assignment title"
                      disabled={isLoading}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={8}
                      className={`textarea ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Provide detailed instructions for this assignment..."
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="card border-red-200 bg-red-50">
                <div className="card-body">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                href="/instructor/assignments"
                className="btn btn-outline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
