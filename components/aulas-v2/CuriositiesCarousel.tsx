'use client'

import { useState, useEffect } from 'react'
import { Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CuriositiesCarouselProps {
  curiosities: string[]
  className?: string
}

export function CuriositiesCarousel({ curiosities, className = '' }: CuriositiesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (curiosities.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % curiosities.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [curiosities])

  if (curiosities.length === 0) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Você Sabia?</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-gray-700 leading-relaxed"
            >
              {curiosities[currentIndex]}
            </motion.p>
          </AnimatePresence>
          
          {/* Indicators */}
          <div className="flex gap-2 mt-4">
            {curiosities.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

