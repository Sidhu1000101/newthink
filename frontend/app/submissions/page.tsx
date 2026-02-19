'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { 
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { submissionsAPI } from '@/services/api'
import { Submission } from '@/services/api'
import Link from 'next/link'

export default function SubmissionsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'EVALUATED'>('ALL')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT') {
      fetchSubmissions()
    }
  }, [isAuthenticated, user])

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await submissionsAPI.getMySubmissions()
      setSubmissions(response.submissions)
    } catch (error) {
      console.error('Error fetching submissions:', error)
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.assignment?.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || submission.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Submissions</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and track all your assignment submissions
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'EVALUATED')}
              className="input"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="EVALUATED">Evaluated</option>
            </select>
            <button className="btn btn-outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Submissions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No submissions found' : 'No submissions yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by submitting your first assignment'
              }
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <Link
                href="/assignments"
                className="btn btn-primary"
              >
                View Assignments
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
                      {submission.assignment?.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {submission.content ? submission.content.substring(0, 100) + '...' : 'PDF submission'}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted {new Date(submission.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`badge ${
                      submission.status === 'EVALUATED' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {submission.status}
                    </span>
                    {submission.score && (
                      <span className="text-sm font-medium text-gray-900">
                        {submission.score}%
                      </span>
                    )}
                  </div>
                  
                  {submission.plagiarismRisk !== undefined && (
                    <div className="flex items-center text-sm mb-4">
                      <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                      <span className={`font-medium ${getPlagiarismRiskColor(submission.plagiarismRisk).split(' ')[0]}`}>
                        {submission.plagiarismRisk.toFixed(1)}% risk
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/submissions/${submission.id}`}
                      className="btn btn-outline flex-1 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    {submission.status === 'EVALUATED' && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Evaluated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
