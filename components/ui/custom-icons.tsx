'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CustomIconProps {
  name: 'chat' | 'enem' | 'professor' | 'dashboard'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: string
}

export const CustomIcon: React.FC<CustomIconProps> = ({ 
  name, 
  size = 'md', 
  className,
  color = 'currentColor'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const iconMap = {
    chat: '/assets/icons/chat-icon.svg',
    enem: '/assets/icons/enem-icon.svg',
    professor: '/assets/icons/professor-icon.svg',
    dashboard: '/assets/icons/dashboard-icon.svg',
  }

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <Image
        src={iconMap[name]}
        alt={`${name} icon`}
        width={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
        height={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
        className="w-full h-full"
        style={{ filter: color !== 'currentColor' ? `brightness(0) saturate(100%) ${color}` : undefined }}
      />
    </div>
  )
}

// Icon with background circle
export const IconWithBackground: React.FC<CustomIconProps & { 
  bgColor?: string 
  textColor?: string 
}> = ({ 
  name, 
  size = 'md', 
  className,
  bgColor = 'bg-primary',
  textColor = 'text-primary-foreground'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      bgColor,
      textColor,
      sizeClasses[size],
      className
    )}>
      <CustomIcon name={name} size={size} />
    </div>
  )
}

// Animated icon for loading states
export const AnimatedIcon: React.FC<CustomIconProps> = ({ 
  name, 
  size = 'md', 
  className 
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <CustomIcon name={name} size={size} />
    </div>
  )
}
