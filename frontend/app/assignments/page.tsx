'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import { 
  Search, 
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  User,
  ArrowRight
} from 'lucide-react'
import { assignmentsAPI, submissionsAPI } from '../../services/api'
import { Assignment, Submission } from '../../services/api'
import Link from 'next/link'

export default function AssignmentsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT') {
      fetchData()
    }
  }, [isAuthenticated, user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [assignmentsRes, submissionsRes] = await Promise.all([
        assignmentsAPI.getAll(),
        submissionsAPI.getMySubmissions()
      ])
      
      setAssignments(assignmentsRes.assignments)
      setMySubmissions(submissionsRes.submissions)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = mySubmissions.find(s => s.assignmentId === assignmentId)
    return submission
  }

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-2xl font-semibold text-gray-900">Available Assignments</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and submit assignments for your courses
            </p>
          </div>
        </div>

        {/* Search */}
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
            <button className="btn btn-outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Assignments Grid */}
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
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No assignments are currently available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const submission = getSubmissionStatus(assignment.id)
              const isSubmitted = !!submission
              
              return (
                <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {assignment.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created {new Date(assignment.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <User className="h-4 w-4 mr-1" />
                      {assignment.creator?.name}
                    </div>
                    
                    {isSubmitted && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
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
                          <div className="text-xs text-gray-500">
                            Plagiarism Risk: {submission.plagiarismRisk.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {isSubmitted ? (
                        <>
                          <Link
                            href={`/submissions/${submission.id}`}
                            className="btn btn-outline flex-1 text-sm"
                          >
                            View Submission
                          </Link>
                          {!submission.content && submission.fileUrl && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${submission.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline flex-1 text-sm"
                            >
                              View File
                            </a>
                          )}
                        </>
                      ) : (
                        <Link
                          href={`/assignments/${assignment.id}/submit`}
                          className="btn btn-primary flex-1"
                        >
                          Submit Assignment
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
