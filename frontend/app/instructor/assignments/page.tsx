'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  FileText,
  Users,
  Calendar
} from 'lucide-react'
import { assignmentsAPI } from '@/services/api'
import { Assignment } from '@/services/api'
import Link from 'next/link'

export default function InstructorAssignmentsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'INSTRUCTOR') {
      fetchAssignments()
    }
  }, [isAuthenticated, user])

  const fetchAssignments = async () => {
    try {
      setIsLoading(true)
      const response = await assignmentsAPI.getMyAssignments()
      setAssignments(response.assignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await assignmentsAPI.delete(id)
      setAssignments(assignments.filter(a => a.id !== id))
      setShowDeleteModal(false)
      setAssignmentToDelete(null)
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and create assignments for your students
              </p>
            </div>
            <Link
              href="/instructor/assignments/create"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Link>
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
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first assignment'}
            </p>
            {!searchTerm && (
              <Link
                href="/instructor/assignments/create"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      {assignment.title}
                    </h3>
                    <div className="flex space-x-1">
                      <Link
                        href={`/instructor/assignments/${assignment.id}/edit`}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setAssignmentToDelete(assignment.id)
                          setShowDeleteModal(true)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {assignment.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {assignment._count?.submissions || 0} submissions
                    </div>
                    <Link
                      href={`/instructor/assignments/${assignment.id}/submissions`}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View Submissions
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Assignment
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this assignment? This action cannot be undone and will also delete all associated submissions.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setAssignmentToDelete(null)
                    }}
                    className="btn btn-outline mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => assignmentToDelete && handleDelete(assignmentToDelete)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
