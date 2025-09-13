"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Database,
  Zap,
  TrendingUp,
  Clock,
  BookOpen,
  Target
} from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    totalMessages: 0,
    tokensUsed: 0,
    quotaLimit: 200000,
    avgResponseTime: 0,
    satisfactionRating: 0
  })

  const [recentActivity, setRecentActivity] = useState<Array<{user: string, action: string, time: string}>>([])
  const [moduleStats, setModuleStats] = useState<Array<{module: string, usage: number, satisfaction: number}>>([])

  useEffect(() => {
    // Load admin data
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Mock data for now - would come from API
      setStats({
        totalUsers: 1250,
        activeChats: 45,
        totalMessages: 15680,
        tokensUsed: 125000,
        quotaLimit: 200000,
        avgResponseTime: 1.2,
        satisfactionRating: 4.6
      })

      setRecentActivity([
        { user: 'João Silva', action: 'Iniciou chat no módulo Professor', time: '2 min atrás' },
        { user: 'Maria Santos', action: 'Completou simulado ENEM', time: '5 min atrás' },
        { user: 'Pedro Costa', action: 'Enviou mensagem no módulo TI', time: '8 min atrás' },
      ])

      setModuleStats([
        { module: 'Professor', usage: 45, satisfaction: 4.8 },
        { module: 'TI', usage: 32, satisfaction: 4.5 },
        { module: 'Secretaria', usage: 28, satisfaction: 4.7 },
        { module: 'Financeiro', usage: 15, satisfaction: 4.3 },
        { module: 'RH', usage: 12, satisfaction: 4.6 },
        { module: 'Atendimento', usage: 38, satisfaction: 4.4 },
        { module: 'Coordenação', usage: 22, satisfaction: 4.7 },
        { module: 'Social Media', usage: 18, satisfaction: 4.2 },
        { module: 'Bem-Estar', usage: 25, satisfaction: 4.9 },
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, monitore uso e configure o sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chats Ativos</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeChats}</div>
                <p className="text-xs text-muted-foreground">
                  +5 desde ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tokensUsed.toLocaleString()}</div>
                <Progress value={(stats.tokensUsed / stats.quotaLimit) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.tokensUsed / stats.quotaLimit) * 100)}% da cota mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta médio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Módulos Mais Usados</CardTitle>
                <CardDescription>
                  Estatísticas de uso por módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleStats.slice(0, 5).map((module, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{module.module}</span>
                        <span>{module.usage}%</span>
                      </div>
                      <Progress value={module.usage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Lista de usuários será implementada aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleStats.map((module, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{module.module}</CardTitle>
                  <CardDescription>
                    Uso: {module.usage}% • Satisfação: {module.satisfaction}/5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso</span>
                      <span>{module.usage}%</span>
                    </div>
                    <Progress value={module.usage} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure parâmetros globais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Configurações serão implementadas aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
