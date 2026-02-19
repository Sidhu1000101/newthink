'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye
} from 'lucide-react'
import { submissionsAPI, assignmentsAPI } from '@/services/api'
import { Assignment, Submission } from '@/services/api'
import Link from 'next/link'

export default function AssignmentSubmissionsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'INSTRUCTOR' && assignmentId) {
      fetchData()
    }
  }, [isAuthenticated, user, assignmentId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [assignmentRes, submissionsRes] = await Promise.all([
        assignmentsAPI.getById(assignmentId),
        submissionsAPI.getByAssignment(assignmentId)
      ])
      
      setAssignment(assignmentRes.assignment)
      setSubmissions(submissionsRes.submissions)
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/instructor/assignments')
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

  const filteredSubmissions = submissions.filter(submission =>
    submission.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.student?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {assignment?.title} - Submissions
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {submissions.length} total submissions
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button className="btn btn-outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No submissions found' : 'No submissions yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Students haven\'t submitted anything yet'}
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plagiarism Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.student?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.student?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.plagiarismRisk !== undefined ? (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                              <span className={`text-sm font-medium ${getPlagiarismRiskColor(submission.plagiarismRisk).split(' ')[0]}`}>
                                {submission.plagiarismRisk.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.score !== undefined ? (
                            <span className="text-sm font-medium text-gray-900">
                              {submission.score}/100
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/instructor/submissions/${submission.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {submission.status === 'EVALUATED' && (
                              <Link
                                href={`/instructor/submissions/${submission.id}/edit`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
