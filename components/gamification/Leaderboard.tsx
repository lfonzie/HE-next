'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, Star, Users, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  points: number
  level: number
  completedLessons: number
  accuracy: number
  streak: number
  lastActive: Date
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'
  onTimeRangeChange?: (range: string) => void
  showCurrentUser?: boolean
  maxEntries?: number
}

export default function Leaderboard({
  entries,
  timeRange,
  onTimeRangeChange,
  showCurrentUser = true,
  maxEntries = 10
}: LeaderboardProps) {
  const [sortedEntries, setSortedEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null)

  useEffect(() => {
    // Sort entries by points (descending)
    const sorted = [...entries].sort((a, b) => b.points - a.points)
    setSortedEntries(sorted.slice(0, maxEntries))
    
    // Find current user entry
    const userEntry = entries.find(entry => entry.isCurrentUser)
    if (userEntry) {
      setCurrentUserEntry(userEntry)
    }
  }, [entries, maxEntries])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Mestre'
    if (level >= 8) return 'Expert'
    if (level >= 6) return 'Avançado'
    if (level >= 4) return 'Intermediário'
    if (level >= 2) return 'Iniciante'
    return 'Novato'
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Agora mesmo'
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  const timeRangeOptions = [
    { value: 'daily', label: 'Hoje' },
    { value: 'weekly', label: 'Esta Semana' },
    { value: 'monthly', label: 'Este Mês' },
    { value: 'all', label: 'Todos os Tempos' }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Estudantes
          </CardTitle>
          <div className="flex gap-1">
            {timeRangeOptions.map(option => (
              <Button
                key={option.value}
                onClick={() => onTimeRangeChange?.(option.value)}
                variant={timeRange === option.value ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 Podium */}
        {sortedEntries.length >= 3 && (
          <div className="flex justify-center items-end gap-4 mb-6">
            {/* 2nd Place */}
            {sortedEntries[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                  <Medal className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-sm font-medium">{sortedEntries[1].name}</div>
                <div className="text-xs text-gray-600">{sortedEntries[1].points} pts</div>
              </motion.div>
            )}

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-yellow-200 rounded-full w-20 h-20 flex items-center justify-center mb-2">
                <Crown className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="text-sm font-medium">{sortedEntries[0].name}</div>
              <div className="text-xs text-gray-600">{sortedEntries[0].points} pts</div>
            </motion.div>

            {/* 3rd Place */}
            {sortedEntries[2] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="bg-amber-200 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <div className="text-sm font-medium">{sortedEntries[2].name}</div>
                <div className="text-xs text-gray-600">{sortedEntries[2].points} pts</div>
              </motion.div>
            )}
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.isCurrentUser 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {isTopThree ? (
                    getRankIcon(rank)
                  ) : (
                    <span className="text-sm font-bold text-gray-500">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Você
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      Nível {entry.level}
                    </Badge>
                    <span>•</span>
                    <span>{entry.completedLessons} aulas</span>
                    <span>•</span>
                    <span>{entry.accuracy}% precisão</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{entry.points}</div>
                    <div className="text-xs text-gray-500">pontos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{entry.streak}</div>
                    <div className="text-xs text-gray-500">sequência</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Current User Position (if not in top entries) */}
        {showCurrentUser && currentUserEntry && !currentUserEntry.isCurrentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t pt-4"
          >
            <div className="text-center text-sm text-gray-600 mb-2">
              Sua posição no ranking
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border-2 border-blue-200">
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-sm font-bold text-blue-600">
                  #{entries.findIndex(e => e.id === currentUserEntry.id) + 1}
                </span>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUserEntry.avatar} />
                <AvatarFallback>
                  {currentUserEntry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">{currentUserEntry.name}</div>
                <div className="text-xs text-gray-600">
                  {currentUserEntry.points} pontos • {currentUserEntry.completedLessons} aulas
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {sortedEntries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum estudante no ranking ainda</p>
            <p className="text-sm">Seja o primeiro a completar uma aula!</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{entries.length}</div>
            <div className="text-xs text-gray-600">Total de Estudantes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.round(entries.reduce((acc, e) => acc + e.accuracy, 0) / entries.length)}%
            </div>
            <div className="text-xs text-gray-600">Precisão Média</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {entries.reduce((acc, e) => acc + e.completedLessons, 0)}
            </div>
            <div className="text-xs text-gray-600">Aulas Completadas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
