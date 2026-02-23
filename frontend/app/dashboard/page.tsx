'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Users
} from 'lucide-react'
import { submissionsAPI, assignmentsAPI } from '@/services/api'
import { Assignment, Submission } from '@/services/api'

interface DashboardStats {
  totalAssignments: number
  completedSubmissions: number
  pendingSubmissions: number
  averageScore: number
  recentSubmissions: Submission[]
  upcomingAssignments: Assignment[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
    averageScore: 0,
    recentSubmissions: [],
    upcomingAssignments: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching dashboard data for user:', user?.role, user?.id)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Dashboard data fetch timeout')), 10000)
      )
      
      if (user?.role === 'STUDENT') {
        // Fetch student data
        console.log('Fetching student data...')
        const [submissionsRes, assignmentsRes] = await Promise.race([
          Promise.all([
            submissionsAPI.getMySubmissions({ limit: 5 }),
            assignmentsAPI.getAll({ limit: 5 })
          ]),
          timeoutPromise
        ]) as [any, any]
        console.log('Student data received:', { submissionsRes, assignmentsRes })

        const completedSubmissions = submissionsRes.submissions.filter(s => s.status === 'EVALUATED')
        const pendingSubmissions = submissionsRes.submissions.filter(s => s.status === 'PENDING')
        const averageScore = completedSubmissions.length > 0
          ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
          : 0

        setStats({
          totalAssignments: assignmentsRes.assignments.length,
          completedSubmissions: completedSubmissions.length,
          pendingSubmissions: pendingSubmissions.length,
          averageScore: Math.round(averageScore),
          recentSubmissions: submissionsRes.submissions,
          upcomingAssignments: assignmentsRes.assignments
        })
      } else if (user?.role === 'INSTRUCTOR') {
        // Fetch instructor data
        console.log('Fetching instructor data...')
        const [myAssignmentsRes] = await Promise.race([
          Promise.all([
            assignmentsAPI.getMyAssignments({ limit: 5 })
          ]),
          timeoutPromise
        ]) as [any]
        console.log('Instructor data received:', myAssignmentsRes)

        const totalSubmissions = myAssignmentsRes.assignments.reduce(
          (sum, assignment) => sum + (assignment._count?.submissions || 0), 
          0
        )

        setStats({
          totalAssignments: myAssignmentsRes.assignments.length,
          completedSubmissions: totalSubmissions,
          pendingSubmissions: 0,
          averageScore: 0,
          recentSubmissions: [],
          upcomingAssignments: myAssignmentsRes.assignments
        })
      } else {
        console.warn('Unknown user role:', user?.role)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default stats on error to prevent infinite loading
      setStats({
        totalAssignments: 0,
        completedSubmissions: 0,
        pendingSubmissions: 0,
        averageScore: 0,
        recentSubmissions: [],
        upcomingAssignments: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your {user?.role === 'STUDENT' ? 'assignments' : 'courses'} today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total {user?.role === 'STUDENT' ? 'Assignments' : 'Created'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalAssignments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-success-100 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'STUDENT' ? 'Completed' : 'Total Submissions'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.completedSubmissions}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {user?.role === 'STUDENT' && (
            <>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
                      <Clock className="h-6 w-6 text-warning-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pendingSubmissions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Score
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.averageScore}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          {user?.role === 'STUDENT' && stats.recentSubmissions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Submissions
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {stats.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {submission.assignment?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent/Upcoming Assignments */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user?.role === 'STUDENT' ? 'Available Assignments' : 'Recent Assignments'}
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {stats.upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created {new Date(assignment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {assignment._count && (
                        <span className="text-sm text-gray-500">
                          {assignment._count.submissions} submissions
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
