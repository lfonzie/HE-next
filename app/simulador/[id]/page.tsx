"use client"

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SimuladorIdRedirect() {
  const router = useRouter()
  const params = useParams()
  const simulatorId = params.id as string

  useEffect(() => {
    // Redirect to the new ENEM route with the same ID
    router.replace(`/enem/${simulatorId}`)
  }, [router, simulatorId])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o simulador ENEM...</p>
      </div>
    </div>
  )
}