'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, BookOpen, Clock, Target, 
  Award, Activity, Calendar, Filter, Download
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  overview: {
    totalStudents: number
    totalLessons: number
    totalTimeSpent: number
    averageAccuracy: number
    completionRate: number
    engagementScore: number
  }
  studentProgress: Array<{
    studentId: string
    name: string
    completedLessons: number
    totalPoints: number
    accuracy: number
    timeSpent: number
    lastActive: Date
  }>
  lessonPerformance: Array<{
    lessonId: string
    title: string
    completionRate: number
    averageScore: number
    averageTime: number
    difficulty: string
    studentCount: number
  }>
  engagementMetrics: Array<{
    date: string
    activeStudents: number
    lessonsCompleted: number
    averageSessionTime: number
    quizAccuracy: number
  }>
  popularContent: Array<{
    type: string
    title: string
    views: number
    completions: number
    rating: number
  }>
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly'
  onTimeRangeChange?: (range: string) => void
  onExport?: () => void
}

export default function AnalyticsDashboard({
  data,
  timeRange,
  onTimeRangeChange,
  onExport
}: AnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [chartType, setChartType] = useState('bar')

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000)
    const minutes = Math.floor((milliseconds % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const overviewCards = [
    {
      title: 'Total de Estudantes',
      value: data.overview.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      title: 'Aulas Completadas',
      value: data.overview.totalLessons,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%'
    },
    {
      title: 'Tempo Total',
      value: formatTime(data.overview.totalTimeSpent),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${data.overview.completionRate}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+5%'
    },
    {
      title: 'Precisão Média',
      value: `${data.overview.averageAccuracy}%`,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '+3%'
    },
    {
      title: 'Engajamento',
      value: `${data.overview.engagementScore}/10`,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '+7%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Analytics</h2>
          <p className="text-gray-600">Insights sobre o desempenho dos estudantes e aulas</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Hoje</SelectItem>
              <SelectItem value="weekly">Esta Semana</SelectItem>
              <SelectItem value="monthly">Este Mês</SelectItem>
              <SelectItem value="yearly">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {card.trend}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-sm text-gray-600">{card.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Progresso dos Estudantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.studentProgress.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalPoints" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lesson Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Performance das Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.lessonPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engajamento ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.engagementMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="activeStudents" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="lessonsCompleted" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.popularContent}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {data.popularContent.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Students */}
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Melhores Estudantes</h4>
              <div className="space-y-2">
                {data.studentProgress
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.studentId} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-gray-600">{student.totalPoints} pontos</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Most Popular Lessons */}
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Aulas Mais Populares</h4>
              <div className="space-y-2">
                {data.lessonPerformance
                  .sort((a, b) => b.studentCount - a.studentCount)
                  .slice(0, 5)
                  .map((lesson, index) => (
                    <div key={lesson.lessonId} className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-gray-600">{lesson.studentCount} estudantes</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Best Content */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Melhor Conteúdo</h4>
              <div className="space-y-2">
                {data.popularContent
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((content, index) => (
                    <div key={content.title} className="flex items-center gap-3 p-2 rounded-lg bg-purple-50">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{content.title}</div>
                        <div className="text-xs text-gray-600">{content.rating}/5 ⭐</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <TrendingUp className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Engajamento em alta:</strong> Os estudantes estão gastando 15% mais tempo nas aulas este mês.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Quizzes interativos:</strong> Aulas com quizzes têm 23% maior taxa de conclusão.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Recomendação:</strong> Considere adicionar mais elementos gamificados nas aulas de Ciências.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}