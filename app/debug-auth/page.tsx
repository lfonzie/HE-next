'use client'

import { AuthDebug } from '@/components/debug/AuthDebug'
import { SessionGuard } from '@/components/auth/SessionGuard'

export default function DebugAuthPage() {
  return (
    <SessionGuard>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        <AuthDebug />
      </div>
    </SessionGuard>
  )
}
