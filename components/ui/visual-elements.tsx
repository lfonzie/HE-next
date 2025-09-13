'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Gradient Background Component
interface GradientBackgroundProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'warm' | 'cool'
  className?: string
  children?: React.ReactNode
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  variant = 'primary', 
  className,
  children 
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    secondary: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    accent: 'bg-gradient-to-br from-purple-50 to-pink-50',
    warm: 'bg-gradient-to-br from-orange-50 to-red-50',
    cool: 'bg-gradient-to-br from-cyan-50 to-blue-50',
  }

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  )
}

// Floating Elements Component
export const FloatingElements: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-yellow-300 rounded-full opacity-25 animate-pulse"></div>
      <div className="absolute bottom-32 right-10 w-24 h-24 bg-orange-100 rounded-full opacity-20 animate-bounce"></div>
    </div>
  )
}

// Card with Visual Effects
interface VisualCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass'
}

export const VisualCard: React.FC<VisualCardProps> = ({ 
  children, 
  className,
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-white shadow-lg border border-gray-100',
    elevated: 'bg-white shadow-2xl border border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm shadow-lg border border-white/20',
  }

  return (
    <div className={cn(
      'rounded-xl p-6 transition-all duration-300',
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}
