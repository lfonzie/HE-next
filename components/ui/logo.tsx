'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className,
  showText = true 
}) => {
  const sizeClasses = {
    sm: variant === 'full' ? 'w-32 h-8' : variant === 'compact' ? 'w-8 h-8' : 'w-6 h-6',
    md: variant === 'full' ? 'w-40 h-10' : variant === 'compact' ? 'w-10 h-10' : 'w-8 h-8',
    lg: variant === 'full' ? 'w-48 h-12' : variant === 'compact' ? 'w-12 h-12' : 'w-10 h-10',
    xl: variant === 'full' ? 'w-56 h-14' : variant === 'compact' ? 'w-14 h-14' : 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <Image
            src="/assets/icon.svg"
            alt="HubEdu.ia"
            width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
            className="w-full h-full object-contain"
            priority
            unoptimized
          />
        </div>
        <div>
          <h1 className={cn('font-bold text-gray-900', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-xl')}>HubEdu.ia</h1>
          <p className={cn('text-gray-600', size === 'sm' ? 'text-xs' : 'text-xs')}>
            Plataforma Educacional
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <Image
            src="/assets/icon.svg"
            alt="HubEdu.ia"
            width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 56}
            height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 56}
            className="w-full h-full object-contain"
            priority
            unoptimized
          />
        </div>
        {showText && (
          <div>
            <h1 className={cn('font-bold text-gray-900', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-xl')}>HubEdu.ia</h1>
            <p className={cn('text-gray-600', size === 'sm' ? 'text-xs' : 'text-xs')}>
              Plataforma Educacional
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <Image
          src="/assets/Logo_HubEdu.ia.svg"
          alt="HubEdu.ia"
          width={size === 'sm' ? 128 : size === 'md' ? 160 : size === 'lg' ? 192 : 224}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 56}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
      </div>
    </div>
  )
}

// Logo with custom styling for specific use cases
export const LogoWithGradient: React.FC<LogoProps> = ({ 
  variant = 'compact', 
  size = 'md', 
  className 
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg p-2">
        <Image
          src="/assets/icon.svg"
          alt="HubEdu.ai"
          width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
      </div>
      <div>
        <h1 className={cn('font-bold text-gray-900', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-xl')}>HubEdu.ai</h1>
        <p className={cn('text-gray-600', size === 'sm' ? 'text-xs' : 'text-xs')}>
          Plataforma Educacional
        </p>
      </div>
    </div>
  )
}

// Animated Logo for loading screens
export const AnimatedLogo: React.FC<LogoProps> = ({ 
  variant = 'compact', 
  size = 'lg', 
  className 
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <Image
          src="/assets/icon.svg"
          alt="HubEdu.ai"
          width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
        {/* Rotating ring around logo */}
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <div>
        <h1 className={cn('font-bold text-gray-900', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-xl')}>HubEdu.ai</h1>
        <p className={cn('text-gray-600', size === 'sm' ? 'text-xs' : 'text-xs')}>
          Plataforma Educacional
        </p>
      </div>
    </div>
  )
}
