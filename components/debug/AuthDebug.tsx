'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function AuthDebug() {
  const { data: session, status, update } = useSession()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    // Get cookie information
    setCookies(document.cookie)
    
    // Try to get token info from localStorage or sessionStorage
    const tokenData = localStorage.getItem('next-auth.session-token') || 
                     sessionStorage.getItem('next-auth.session-token')
    if (tokenData) {
      try {
        setTokenInfo(JSON.parse(tokenData))
      } catch (e) {
        setTokenInfo({ raw: tokenData })
      }
    }
  }, [])

  const refreshSession = async () => {
    await update()
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'authenticated':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unauthenticated':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-100 text-yellow-800'
      case 'authenticated':
        return 'bg-green-100 text-green-800'
      case 'unauthenticated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Auth Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor()}>
              {status}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshSession}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>

          {session && (
            <div>
              <h4 className="font-medium mb-2">Session Data:</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Cookies:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {cookies}
            </pre>
          </div>

          {tokenInfo && (
            <div>
              <h4 className="font-medium mb-2">Token Info:</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Environment:</h4>
            <div className="text-xs space-y-1">
              <div>NODE_ENV: {process.env.NODE_ENV}</div>
              <div>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}</div>
              <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'Not set'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
