'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react'
import { submissionsAPI } from '@/services/api'
import { Submission } from '@/services/api'
import Link from 'next/link'

export default function SubmissionDetailPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const submissionId = params.id as string
  
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    score: 0,
    feedbackSummary: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'INSTRUCTOR' && submissionId) {
      fetchSubmission()
    }
  }, [isAuthenticated, user, submissionId])

  const fetchSubmission = async () => {
    try {
      const response = await submissionsAPI.getById(submissionId)
      setSubmission(response.submission)
      setEditForm({
        score: response.submission.score || 0,
        feedbackSummary: response.submission.feedbackSummary || ''
      })
    } catch (error) {
      console.error('Error fetching submission:', error)
      router.push('/instructor/assignments')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({
      score: submission?.score || 0,
      feedbackSummary: submission?.feedbackSummary || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      score: submission?.score || 0,
      feedbackSummary: submission?.feedbackSummary || ''
    })
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await submissionsAPI.updateScore(submissionId, editForm)
      setSubmission(prev => prev ? {
        ...prev,
        ...editForm
      } : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlagiarismRiskColor = (risk: number) => {
    if (risk > 70) return 'text-red-600 bg-red-100'
    if (risk > 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EVALUATED':
        return 'text-green-800 bg-green-100'
      case 'PENDING':
        return 'text-yellow-800 bg-yellow-100'
      default:
        return 'text-gray-800 bg-gray-100'
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

  if (!submission) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Submission Not Found</h1>
            <p className="text-gray-600">The requested submission does not exist.</p>
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
              href={`/instructor/assignments/${submission.assignmentId}/submissions`}
              className="btn btn-outline mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {submission.assignment?.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Submission by {submission.student?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Content */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Submission Content</h3>
              </div>
              <div className="card-body">
                {submission.content ? (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {submission.content}
                    </p>
                  </div>
                ) : submission.fileUrl ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      This submission was uploaded as a PDF file
                    </p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${submission.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      View PDF File
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No content available</p>
                )}
              </div>
            </div>

            {/* AI Feedback */}
            {submission.feedbackSummary && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">AI Feedback</h3>
                </div>
                <div className="card-body">
                  <p className="text-gray-700">{submission.feedbackSummary}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Submission Info</h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{submission.student?.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {submission.plagiarismRisk !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plagiarism Risk</label>
                    <div className="mt-1">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlagiarismRiskColor(submission.plagiarismRisk)}`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {submission.plagiarismRisk.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Score & Feedback */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Score & Feedback</h3>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.score}
                        onChange={(e) => setEditForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Summary
                      </label>
                      <textarea
                        value={editForm.feedbackSummary}
                        onChange={(e) => setEditForm(prev => ({ ...prev, feedbackSummary: e.target.value }))}
                        rows={4}
                        className="textarea"
                        placeholder="Provide feedback to the student..."
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="btn btn-primary flex-1"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-outline flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Score</label>
                      <div className="mt-1">
                        {submission.score !== undefined ? (
                          <span className="text-2xl font-bold text-gray-900">
                            {submission.score}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">Not scored</span>
                        )}
                      </div>
                    </div>
                    
                    {submission.feedbackSummary && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Feedback</label>
                        <div className="mt-1">
                          <p className="text-sm text-gray-700">{submission.feedbackSummary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
