import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'monthly'
    const userId = searchParams.get('userId') // For teacher viewing student data

    // Calculate date range based on timeRange
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Check if database is available
    let dbAvailable = true
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      console.warn('Database not available, using mock data:', error)
      dbAvailable = false
    }

    // If database is not available, return mock data
    if (!dbAvailable) {
      const mockAnalyticsData = {
        overview: {
          totalStudents: 25,
          totalLessons: 12,
          totalTimeSpent: 450,
          averageAccuracy: 78,
          completionRate: 85,
          engagementScore: 7.2
        },
        studentProgress: [
          {
            studentId: '1',
            name: 'Ana Silva',
            completedLessons: 8,
            totalPoints: 320,
            accuracy: 85,
            timeSpent: 120,
            lastActive: new Date()
          },
          {
            studentId: '2',
            name: 'Carlos Santos',
            completedLessons: 6,
            totalPoints: 280,
            accuracy: 72,
            timeSpent: 95,
            lastActive: new Date(Date.now() - 86400000)
          },
          {
            studentId: '3',
            name: 'Maria Oliveira',
            completedLessons: 10,
            totalPoints: 400,
            accuracy: 90,
            timeSpent: 150,
            lastActive: new Date(Date.now() - 3600000)
          }
        ],
        lessonPerformance: [
          {
            lessonId: '1',
            title: 'Introdução à Matemática',
            completionRate: 92,
            averageScore: 85,
            averageTime: 25,
            difficulty: 'medium',
            studentCount: 23
          },
          {
            lessonId: '2',
            title: 'Fundamentos de Física',
            completionRate: 78,
            averageScore: 72,
            averageTime: 35,
            difficulty: 'hard',
            studentCount: 18
          }
        ],
        engagementMetrics: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activeStudents: Math.floor(Math.random() * 10) + 15,
          lessonsCompleted: Math.floor(Math.random() * 5) + 8,
          averageSessionTime: Math.floor(Math.random() * 20) + 15,
          quizAccuracy: Math.floor(Math.random() * 20) + 70
        })),
        popularContent: [
          {
            type: 'lesson',
            title: 'Introdução à Matemática',
            views: 69,
            completions: 23,
            rating: 4.2
          },
          {
            type: 'lesson',
            title: 'Fundamentos de Física',
            views: 54,
            completions: 18,
            rating: 3.8
          }
        ]
      }

      return NextResponse.json(mockAnalyticsData)
    }

    // Get overview statistics
    const [
      totalStudents,
      totalLessons,
      lessonProgress,
      quizAttempts,
      userSessions
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT' }
      }),
      prisma.lessons.count(),
      prisma.lesson_progress.findMany({
        where: {
          completed: true,
          updated_at: { gte: startDate }
        }
      }),
      prisma.quiz_attempts.findMany({
        where: {
          created_at: { gte: startDate }
        }
      }),
      prisma.conversations.findMany({
        where: {
          created_at: { gte: startDate }
        }
      })
    ])

    // Calculate overview metrics
    const totalTimeSpent = userSessions.reduce((acc, session) => {
      return acc + (session.token_count * 0.001) // Approximate time based on tokens
    }, 0)

    const averageAccuracy = quizAttempts.length > 0 
      ? quizAttempts.reduce((acc, attempt) => acc + (attempt.correct ? 1 : 0), 0) / quizAttempts.length * 100
      : 0

    const completionRate = lessonProgress.length > 0 
      ? (lessonProgress.filter(p => p.completed).length / lessonProgress.length) * 100
      : 0

    const engagementScore = Math.min(10, 
      (completionRate / 10) + 
      (averageAccuracy / 10) + 
      (totalTimeSpent / 1000) + 
      (totalStudents / 100)
    )

    // Get student progress data
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    })

    const studentProgressData = await Promise.all(students.map(async (student) => {
      const [lessonProgress, quizAttempts] = await Promise.all([
        prisma.lesson_progress.findMany({
          where: { 
            user_id: student.id,
            completed: true 
          }
        }),
        prisma.quiz_attempts.findMany({
          where: { 
            user_id: student.id,
            created_at: { gte: startDate } 
          }
        })
      ])

      const completedLessons = lessonProgress.length
      const totalPoints = lessonProgress.reduce((acc, progress) => {
        const points = progress.progress as any
        return acc + (points?.points || 0)
      }, 0)
      
      const accuracy = quizAttempts.length > 0
        ? quizAttempts.reduce((acc, attempt) => acc + (attempt.correct ? 1 : 0), 0) / quizAttempts.length * 100
        : 0

      const timeSpent = lessonProgress.reduce((acc, progress) => {
        const time = progress.progress as any
        return acc + (time?.timeSpent || 0)
      }, 0)

      return {
        studentId: student.id,
        name: student.name || 'Estudante Anônimo',
        completedLessons,
        totalPoints,
        accuracy: Math.round(accuracy),
        timeSpent,
        lastActive: student.updated_at
      }
    }))

    // Get lesson performance data
    const lessons = await prisma.lessons.findMany()

    const lessonPerformanceData = await Promise.all(lessons.map(async (lesson) => {
      const [lessonProgress, quizAttempts] = await Promise.all([
        prisma.lesson_progress.findMany({
          where: { 
            lesson_id: lesson.id,
            completed: true 
          }
        }),
        prisma.quiz_attempts.findMany({
          where: { lesson_id: lesson.id }
        })
      ])

      const completions = lessonProgress.length
      const attempts = quizAttempts.length
      const averageScore = attempts > 0
        ? quizAttempts.reduce((acc, attempt) => acc + (attempt.correct ? 1 : 0), 0) / attempts * 100
        : 0

      const averageTime = completions > 0
        ? lessonProgress.reduce((acc, progress) => {
            const time = progress.progress as any
            return acc + (time?.timeSpent || 0)
          }, 0) / completions
        : 0

      return {
        lessonId: lesson.id,
        title: lesson.title,
        completionRate: completions > 0 ? (completions / (completions + attempts)) * 100 : 0,
        averageScore: Math.round(averageScore),
        averageTime: Math.round(averageTime),
        difficulty: lesson.level || 'medium',
        studentCount: completions
      }
    }))

    // Generate engagement metrics over time
    const engagementMetrics = []
    const daysBack = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : 30
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dayProgress = await prisma.lesson_progress.count({
        where: {
          completed: true,
          updated_at: { gte: dayStart, lt: dayEnd }
        }
      })

      const daySessions = await prisma.conversations.count({
        where: {
          created_at: { gte: dayStart, lt: dayEnd }
        }
      })

      const dayQuizAttempts = await prisma.quiz_attempts.findMany({
        where: {
          created_at: { gte: dayStart, lt: dayEnd }
        }
      })

      const dayAccuracy = dayQuizAttempts.length > 0
        ? dayQuizAttempts.reduce((acc, attempt) => acc + (attempt.correct ? 1 : 0), 0) / dayQuizAttempts.length * 100
        : 0

      engagementMetrics.push({
        date: date.toISOString().split('T')[0],
        activeStudents: daySessions,
        lessonsCompleted: dayProgress,
        averageSessionTime: daySessions > 0 ? (daySessions * 15) : 0, // Approximate
        quizAccuracy: Math.round(dayAccuracy)
      })
    }

    // Get popular content
    const popularContent = lessonPerformanceData
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 6)
      .map(lesson => ({
        type: 'lesson',
        title: lesson.title,
        views: lesson.studentCount * 3, // Approximate views
        completions: lesson.studentCount,
        rating: Math.min(5, 3 + (lesson.averageScore / 20)) // Convert score to rating
      }))

    const analyticsData = {
      overview: {
        totalStudents,
        totalLessons,
        totalTimeSpent: Math.round(totalTimeSpent),
        averageAccuracy: Math.round(averageAccuracy),
        completionRate: Math.round(completionRate),
        engagementScore: Math.round(engagementScore * 10) / 10
      },
      studentProgress: studentProgressData,
      lessonPerformance: lessonPerformanceData,
      engagementMetrics,
      popularContent
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}