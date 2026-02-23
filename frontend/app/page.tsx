'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Award,
  Shield
} from 'lucide-react'

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-24">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-6">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                Intelligent Assignment
                <span className="block text-primary-600">Evaluation Platform</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
                Transform education with AI-powered plagiarism detection and automated feedback generation. 
                Save time while providing quality assessment for every student.
              </p>
              <div className="mt-10 flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="btn btn-primary px-8 py-3 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline px-8 py-3 text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful Features for Modern Education
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to manage assignments, detect plagiarism, and provide meaningful feedback.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Advanced Plagiarism Detection
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  TF-IDF vectorization and cosine similarity algorithms identify potential plagiarism 
                  with high accuracy, ensuring academic integrity.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100">
                  <Award className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  AI-Powered Feedback
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  OpenAI integration provides instant, constructive feedback and scoring, 
                  helping students improve their work efficiently.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-warning-100">
                  <Users className="h-8 w-8 text-warning-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Role-Based Access
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Separate dashboards for students and instructors with tailored features 
                  and appropriate permissions for each user type.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-purple-100">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  File Upload Support
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Support for PDF file uploads with automatic text extraction, 
                  making it easy to submit various types of assignments.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Real-time Processing
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Asynchronous processing ensures submissions are evaluated quickly 
                  without blocking the user interface.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-pink-100">
                  <TrendingUp className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Analytics & Insights
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Comprehensive dashboards provide insights into submission trends, 
                  performance metrics, and plagiarism statistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="mt-4 text-lg text-primary-200">
            Join thousands of educators and students already using our platform 
            for smarter assignment evaluation.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-white">EduEval</span>
            </div>
            <p className="text-gray-400">
              © 2024 EduEval. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
