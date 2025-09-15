'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Target, Clock, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProgressData {
  totalPoints: number
  completedStages: number
  totalStages: number
  timeSpent: number
  streak: number
  accuracy: number
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    earnedAt?: Date
  }>
}

interface ProgressTrackerProps {
  progressData: ProgressData
  onBadgeEarned?: (badge: any) => void
  showAnimations?: boolean
}

export default function ProgressTracker({
  progressData,
  onBadgeEarned,
  showAnimations = true
}: ProgressTrackerProps) {
  const [newBadges, setNewBadges] = useState<any[]>([])
  const [showBadgeNotification, setShowBadgeNotification] = useState(false)

  // Check for new badges
  useEffect(() => {
    const newlyEarned = progressData.badges.filter(badge => 
      badge.earned && badge.earnedAt && 
      new Date(badge.earnedAt).getTime() > Date.now() - 5000 // Earned in last 5 seconds
    )

    if (newlyEarned.length > 0) {
      setNewBadges(newlyEarned)
      setShowBadgeNotification(true)
      onBadgeEarned?.(newlyEarned[0])
      
      setTimeout(() => {
        setShowBadgeNotification(false)
        setNewBadges([])
      }, 3000)
    }
  }, [progressData.badges, onBadgeEarned])

  const progressPercentage = progressData.totalStages > 0 
    ? (progressData.completedStages / progressData.totalStages) * 100 
    : 0

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getLevel = (points: number) => {
    if (points >= 1000) return { level: 10, title: 'Mestre', color: 'text-purple-600' }
    if (points >= 800) return { level: 9, title: 'Expert', color: 'text-blue-600' }
    if (points >= 600) return { level: 8, title: 'Avançado', color: 'text-green-600' }
    if (points >= 400) return { level: 7, title: 'Intermediário', color: 'text-yellow-600' }
    if (points >= 200) return { level: 6, title: 'Iniciante+', color: 'text-orange-600' }
    if (points >= 100) return { level: 5, title: 'Iniciante', color: 'text-gray-600' }
    return { level: 1, title: 'Novato', color: 'text-gray-500' }
  }

  const currentLevel = getLevel(progressData.totalPoints)
  const nextLevelPoints = Math.ceil(progressData.totalPoints / 100) * 100
  const levelProgress = (progressData.totalPoints % 100) / 100 * 100

  return (
    <div className="space-y-6">
      {/* Badge Notification */}
      <AnimatePresence>
        {showBadgeNotification && newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="border-yellow-400 bg-yellow-50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Nova Conquista!</h4>
                    <p className="text-sm text-yellow-700">{newBadges[0].name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso da Aula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Etapas Completadas</span>
              <span className="text-sm text-gray-600">
                {progressData.completedStages}/{progressData.totalStages}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-3 bg-blue-50 rounded-lg"
            >
              <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-800">{progressData.totalPoints}</div>
              <div className="text-xs text-blue-600">Pontos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-3 bg-green-50 rounded-lg"
            >
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-800">
                {formatTime(progressData.timeSpent)}
              </div>
              <div className="text-xs text-green-600">Tempo</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-3 bg-purple-50 rounded-lg"
            >
              <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-800">{progressData.streak}</div>
              <div className="text-xs text-purple-600">Sequência</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-3 bg-orange-50 rounded-lg"
            >
              <Trophy className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-800">
                {Math.round(progressData.accuracy)}%
              </div>
              <div className="text-xs text-orange-600">Precisão</div>
            </motion.div>
          </div>

          {/* Level Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Nível</span>
                <Badge className={`${currentLevel.color} bg-opacity-20`}>
                  {currentLevel.level} - {currentLevel.title}
                </Badge>
              </div>
              <span className="text-sm text-gray-600">
                {progressData.totalPoints}/{nextLevelPoints} pts
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas ({progressData.badges.filter(b => b.earned).length}/{progressData.badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progressData.badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  badge.earned 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {badge.earned ? badge.icon : '🔒'}
                  </div>
                  <h4 className={`font-medium text-sm ${
                    badge.earned ? 'text-yellow-800' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    badge.earned ? 'text-yellow-700' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                </div>
                
                {badge.earned && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para Ganhar Mais Pontos:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Complete todas as etapas da aula</li>
            <li>• Responda corretamente aos quizzes</li>
            <li>• Participe das discussões</li>
            <li>• Termine a aula sem ajuda externa</li>
            <li>• Mantenha uma sequência de aulas completadas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
