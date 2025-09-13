'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface ApiResponse {
  users: User[]
  total: number
  timestamp: string
}

export default function ApiDemo() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data: ApiResponse = await response.json()
      setUsers(data.users)
      setError(null)
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      
      if (response.ok) {
        setNewUser({ name: '', email: '', role: 'user' })
        fetchUsers() // Refresh the list
      } else {
        setError('Failed to add user')
      }
    } catch (err) {
      setError('Failed to add user')
    }
  }

  const testHelloApi = async () => {
    try {
      const response = await fetch('/api/hello?name=Developer')
      const data = await response.json()
      alert(`API Response: ${data.message}`)
    } catch (err) {
      alert('Failed to call hello API')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            API Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the built-in API routes and see how they work with the frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Users API Demo */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Users API</h2>
            
            {/* Add User Form */}
            <form onSubmit={addUser} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                Add User
              </button>
            </form>

            {/* Users List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Users</h3>
                <button
                  onClick={fetchUsers}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hello API Demo */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hello API</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Test the Hello Endpoint</h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to test the /api/hello endpoint with a custom name parameter.
                </p>
                <button
                  onClick={testHelloApi}
                  className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Test Hello API
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">API Endpoints</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        GET
                      </span>
                      <code className="text-sm font-mono">/api/hello</code>
                    </div>
                    <p className="text-sm text-gray-600">Returns a greeting message with optional name parameter</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        GET
                      </span>
                      <code className="text-sm font-mono">/api/users</code>
                    </div>
                    <p className="text-sm text-gray-600">Returns list of users with optional role filter</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        POST
                      </span>
                      <code className="text-sm font-mono">/api/users</code>
                    </div>
                    <p className="text-sm text-gray-600">Creates a new user with name, email, and role</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
