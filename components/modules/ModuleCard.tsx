import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red'
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600'
}

const iconColorVariants = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
  red: 'text-red-600'
}

export function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  features, 
  color 
}: ModuleCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-100 hover:border-gray-200 group">
        <div className="flex items-start space-x-4 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center flex-shrink-0",
            colorVariants[color]
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Principais funcionalidades:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0",
                  iconColorVariants[color]
                )} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Acessar módulo</span>
            <svg 
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
