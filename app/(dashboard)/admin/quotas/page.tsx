'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  RefreshCw, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  RotateCcw,
  Edit
} from 'lucide-react'

interface QuotaStats {
  totalUsers: number
  totalTokenLimit: number
  totalTokenUsed: number
  averageUsage: number
  topUsers: Array<{
    id: string
    token_limit: number
    token_used: number
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }>
}

interface QuotaStatus {
  userId: string
  month: string
  tokenLimit: number
  tokenUsed: number
  remainingTokens: number
  percentageUsed: number
  dailyUsage?: number
  hourlyUsage?: number
  costUsd?: number
  costBrl?: number
  isActive: boolean
}

export default function QuotaAdminPanel() {
  const [stats, setStats] = useState<QuotaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [newLimit, setNewLimit] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)

  // Gerar lista de meses dos últimos 12 meses
  const generateMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
      months.push({ value: monthStr, label: monthLabel })
    }
    return months
  }

  const months = generateMonths()

  useEffect(() => {
    loadStats()
  }, [selectedMonth])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (selectedMonth) {
        params.append('month', selectedMonth)
      }
      
      const response = await fetch(`/api/quota/admin/stats?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }
      
      const data = await response.json()
      setStats(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleResetQuota = async () => {
    if (!selectedUser) return
    
    try {
      setActionLoading(true)
      
      const response = await fetch('/api/quota/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          month: selectedMonth || undefined
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao resetar quota')
      }
      
      await loadStats()
      setResetDialogOpen(false)
      setSelectedUser('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar quota')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateLimit = async () => {
    if (!selectedUser || !newLimit) return
    
    try {
      setActionLoading(true)
      
      const response = await fetch('/api/quota/admin/limit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          newLimit: parseInt(newLimit),
          month: selectedMonth || undefined
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar limite')
      }
      
      await loadStats()
      setLimitDialogOpen(false)
      setSelectedUser('')
      setNewLimit('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar limite')
    } finally {
      setActionLoading(false)
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive'
    if (percentage >= 75) return 'secondary'
    return 'default'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando estatísticas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel de Quotas</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Mês atual</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <>
          {/* Cards de estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalTokenLimit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalTokenUsed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTokenLimit > 0 
                    ? `${Math.round((stats.totalTokenUsed / stats.totalTokenLimit) * 100)}% do limite`
                    : '0% do limite'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageUsage.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">tokens por usuário</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de usuários com maior uso */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários com Maior Uso de Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Usado</TableHead>
                    <TableHead>Restante</TableHead>
                    <TableHead>Uso %</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topUsers.map((quota) => {
                    const percentage = Math.round((quota.token_used / quota.token_limit) * 100)
                    const remaining = quota.token_limit - quota.token_used
                    
                    return (
                      <TableRow key={quota.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quota.user.name || 'Sem nome'}</div>
                            <div className="text-sm text-muted-foreground">{quota.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{quota.user.role}</Badge>
                        </TableCell>
                        <TableCell>{quota.token_limit.toLocaleString()}</TableCell>
                        <TableCell>{quota.token_used.toLocaleString()}</TableCell>
                        <TableCell className={getUsageColor(percentage)}>
                          {remaining.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={percentage} 
                              className="w-16" 
                            />
                            <Badge variant={getUsageBadgeVariant(percentage)}>
                              {percentage}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(quota.user.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resetar Quota</DialogTitle>
                                  <DialogDescription>
                                    Tem certeza que deseja resetar a quota de {quota.user.name}?
                                    Esta ação irá zerar o uso de tokens e limpar o histórico.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setResetDialogOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleResetQuota}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? 'Resetando...' : 'Resetar'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(quota.user.id)
                                    setNewLimit(quota.token_limit.toString())
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Atualizar Limite</DialogTitle>
                                  <DialogDescription>
                                    Alterar o limite de tokens para {quota.user.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="newLimit">Novo Limite de Tokens</Label>
                                    <Input
                                      id="newLimit"
                                      type="number"
                                      value={newLimit}
                                      onChange={(e) => setNewLimit(e.target.value)}
                                      placeholder="Ex: 200000"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setLimitDialogOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleUpdateLimit}
                                    disabled={actionLoading || !newLimit}
                                  >
                                    {actionLoading ? 'Atualizando...' : 'Atualizar'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
