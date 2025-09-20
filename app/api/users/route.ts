import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  
  let filteredUsers = users
  
  if (role) {
    filteredUsers = users.filter(user => user.role === role)
  }
  
  return NextResponse.json({
    users: filteredUsers,
    total: filteredUsers.length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role = 'user' } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      role,
    }
    
    users.push(newUser)
    
    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
      timestamp: new Date().toISOString(),
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    )
  }
}
