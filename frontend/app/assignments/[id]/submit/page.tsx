'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Upload,
  FileText,
  Send,
  AlertCircle
} from 'lucide-react'
import { assignmentsAPI, submissionsAPI } from '@/services/api'
import { Assignment } from '@/services/api'
import Link from 'next/link'

export default function SubmitAssignmentPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    content: '',
    file: null as File | null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAssignment = async () => {
    try {
      const response = await assignmentsAPI.getById(assignmentId)
      setAssignment(response.assignment)
    } catch (error) {
      console.error('Error fetching assignment:', error)
      router.push('/assignments')
    }
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT' && assignmentId) {
      fetchAssignment()
    }
  }, [isAuthenticated, user, assignmentId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.content.trim() && !formData.file) {
      newErrors.content = 'Please provide either text content or upload a file'
    }

    if (formData.content.trim() && formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = {
        assignmentId,
        ...(formData.content.trim() && { content: formData.content.trim() }),
        ...(formData.file && { file: formData.file })
      }

      await submissionsAPI.create(submissionData)
      router.push('/submissions')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit assignment'
      setErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        setErrors({ file: 'Only PDF files are allowed' })
        return
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 10MB' })
        return
      }

      setFormData(prev => ({ ...prev, file }))
      setErrors(prev => ({ ...prev, file: '' }))
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setFormData(prev => ({ ...prev, content }))
    
    // Clear error when user starts typing
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }))
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user?.role !== 'STUDENT') {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available to students.</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!assignment) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
            <p className="text-gray-600">The requested assignment does not exist.</p>
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
              href="/assignments"
              className="btn btn-outline mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Submit Assignment</h1>
              <p className="mt-1 text-sm text-gray-600">
                {assignment.title}
              </p>
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          </div>
        </div>

        {/* Submission Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submit Text Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={handleContentChange}
                      rows={12}
                      className={`textarea ${errors.content ? 'border-red-500' : ''}`}
                      placeholder="Write your assignment content here..."
                      disabled={isSubmitting}
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-gray-500 text-sm font-medium">OR</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF File
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="btn btn-outline cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                      </label>
                      {formData.file && (
                        <span className="text-sm text-gray-600">
                          {formData.file.name}
                        </span>
                      )}
                    </div>
                    {errors.file && (
                      <p className="mt-1 text-sm text-red-600">{errors.file}</p>
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
                href="/assignments"
                className="btn btn-outline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || (!formData.content.trim() && !formData.file)}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Assignment
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
