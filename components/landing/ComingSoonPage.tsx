'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const AnimatedBackground: React.FC = () => {
  const particlePositions = [
    { left: 49.47, top: 25.68, xOffset: 23.5, duration: 5.2, delay: 1.8 },
    { left: 91.05, top: 8.13, xOffset: -31.2, duration: 6.8, delay: 0.3 },
    { left: 12.83, top: 24.59, xOffset: 18.7, duration: 4.5, delay: 2.1 },
    { left: 26.74, top: 44.98, xOffset: -12.3, duration: 7.1, delay: 0.9 },
    { left: 84.74, top: 65.74, xOffset: 28.9, duration: 5.9, delay: 1.5 },
    { left: 87.42, top: 61.95, xOffset: -19.6, duration: 6.3, delay: 0.7 },
    { left: 96.72, top: 60.31, xOffset: 15.4, duration: 4.8, delay: 2.4 },
    { left: 98.31, top: 67.02, xOffset: -25.1, duration: 7.5, delay: 0.5 },
    { left: 96.65, top: 53.19, xOffset: 22.8, duration: 5.6, delay: 1.2 },
    { left: 7.62, top: 12.03, xOffset: -8.9, duration: 6.7, delay: 0.8 },
    { left: 91.54, top: 84.94, xOffset: 31.5, duration: 4.2, delay: 2.7 },
    { left: 39.16, top: 29.32, xOffset: -16.2, duration: 7.8, delay: 0.4 },
    { left: 87.48, top: 39.76, xOffset: 24.6, duration: 5.4, delay: 1.6 },
    { left: 0.84, top: 32.55, xOffset: -14.7, duration: 6.9, delay: 0.2 },
    { left: 26.54, top: 92.12, xOffset: 19.3, duration: 4.6, delay: 2.5 },
    { left: 62.75, top: 39.12, xOffset: -27.8, duration: 7.2, delay: 0.6 },
    { left: 20.03, top: 0.61, xOffset: 11.5, duration: 5.7, delay: 1.9 },
    { left: 50.35, top: 95.11, xOffset: -21.4, duration: 6.4, delay: 0.1 },
    { left: 62.9, top: 29.06, xOffset: 17.9, duration: 4.9, delay: 2.8 },
    { left: 37.25, top: 90.79, xOffset: -29.6, duration: 7.6, delay: 0.3 },
    { left: 32.29, top: 80.27, xOffset: 13.2, duration: 5.1, delay: 2.2 },
    { left: 18.99, top: 33.24, xOffset: -18.5, duration: 6.5, delay: 0.9 },
    { left: 10.65, top: 8.83, xOffset: 26.7, duration: 4.7, delay: 2.6 },
    { left: 95.16, top: 28.43, xOffset: -15.8, duration: 7.3, delay: 0.7 },
    { left: 69.39, top: 60.68, xOffset: 20.1, duration: 5.8, delay: 1.4 },
    { left: 3.08, top: 95.71, xOffset: -24.3, duration: 6.2, delay: 0.8 },
    { left: 63.19, top: 24.87, xOffset: 16.4, duration: 4.4, delay: 2.9 },
    { left: 59.99, top: 34.41, xOffset: -22.7, duration: 7.4, delay: 0.4 },
    { left: 5.66, top: 26.85, xOffset: 14.6, duration: 5.3, delay: 2.1 },
    { left: 96.23, top: 15.22, xOffset: -19.2, duration: 6.6, delay: 0.6 },
    { left: 12.9, top: 29.02, xOffset: 25.3, duration: 4.8, delay: 2.4 },
    { left: 68.75, top: 97.53, xOffset: -17.1, duration: 7.7, delay: 0.2 },
    { left: 80.29, top: 39.74, xOffset: 21.8, duration: 5.5, delay: 1.7 },
    { left: 37.17, top: 86.2, xOffset: -13.9, duration: 6.8, delay: 0.5 },
    { left: 14.49, top: 31.59, xOffset: 28.4, duration: 4.3, delay: 2.7 },
    { left: 54.76, top: 56.69, xOffset: -26.5, duration: 7.1, delay: 0.9 },
    { left: 26.36, top: 92.24, xOffset: 12.7, duration: 5.9, delay: 1.8 },
    { left: 82.58, top: 72.34, xOffset: -23.8, duration: 6.7, delay: 0.1 },
    { left: 82.01, top: 33.24, xOffset: 18.3, duration: 4.5, delay: 2.3 },
    { left: 45.72, top: 97.9, xOffset: -30.2, duration: 7.9, delay: 0.8 }
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          animate={{
            y: [0, -150, 0],
            x: [0, pos.xOffset, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            delay: pos.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
          x: [0, -50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 transform bg-gradient-to-r from-yellow-500/15 to-orange-400/15 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

const FloatingIcons: React.FC = () => {
  const iconData = [
    { left: 54.24, top: 18.83, icon: '📚', duration: 7.2, delay: 1.3 },
    { left: 78.8, top: 45.57, icon: '🎓', duration: 8.5, delay: 0.7 },
    { left: 23.15, top: 72.39, icon: '💡', duration: 6.8, delay: 2.1 },
    { left: 67.42, top: 31.25, icon: '🚀', duration: 9.1, delay: 0.4 },
    { left: 45.89, top: 88.64, icon: '⭐', duration: 7.6, delay: 1.8 },
    { left: 12.73, top: 56.78, icon: '🎯', duration: 8.3, delay: 0.9 },
    { left: 89.34, top: 23.67, icon: '📖', duration: 6.5, delay: 2.4 },
    { left: 34.56, top: 67.89, icon: '🔬', duration: 7.9, delay: 1.1 },
    { left: 76.23, top: 14.52, icon: '🎨', duration: 8.7, delay: 0.6 },
    { left: 18.47, top: 82.15, icon: '🧮', duration: 6.2, delay: 2.7 },
    { left: 61.89, top: 45.23, icon: '💻', duration: 7.4, delay: 1.5 },
    { left: 42.17, top: 29.86, icon: '🌐', duration: 8.1, delay: 0.8 },
    { left: 85.63, top: 71.94, icon: '🎪', duration: 6.9, delay: 2.2 },
    { left: 27.84, top: 38.72, icon: '🏆', duration: 7.8, delay: 1.2 },
    { left: 73.51, top: 59.48, icon: '📊', duration: 8.4, delay: 0.5 },
    { left: 15.92, top: 91.37, icon: '📚', duration: 6.7, delay: 2.5 },
    { left: 58.26, top: 16.84, icon: '🎓', duration: 7.3, delay: 1.6 },
    { left: 39.75, top: 63.29, icon: '💡', duration: 8.8, delay: 0.3 },
    { left: 82.14, top: 47.56, icon: '🚀', duration: 6.4, delay: 2.8 },
    { left: 26.38, top: 74.21, icon: '⭐', duration: 7.7, delay: 1 }
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {iconData.map((data, i) => (
        <motion.div
          key={`${data.icon}-${i}`}
          className="absolute text-2xl text-yellow-400/30"
          style={{ left: `${data.left}%`, top: `${data.top}%` }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: data.duration,
            repeat: Infinity,
            delay: data.delay,
            ease: 'easeInOut'
          }}
        >
          {data.icon}
        </motion.div>
      ))}
    </div>
  )
}

export function ComingSoonPage() {
  const [loadingText, setLoadingText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const text = 'EM BREVE'

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let cancelled = false

    const runTypingLoop = (index: number) => {
      if (cancelled) return

      if (index <= text.length) {
        setLoadingText(text.slice(0, index))
        setCurrentIndex(index)
        timeoutId = setTimeout(() => runTypingLoop(index + 1), 200)
      } else {
        timeoutId = setTimeout(() => runTypingLoop(0), 2000)
      }
    }

    setLoadingText('')
    setCurrentIndex(0)
    runTypingLoop(1)

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [text])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 600)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black px-4 sm:px-6">
      <AnimatedBackground />
      <FloatingIcons />

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 193, 7, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 193, 7, 0.1) 1px, transparent 1px)",
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div
        className="relative z-10 mb-8 sm:mb-12"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative">
          <Image
            src="/assets/Logo_HubEdu.ia.svg"
            alt="HubEdu.ia Logo"
            width={240}
            height={96}
            className="h-20 w-auto filter drop-shadow-2xl sm:h-24"
            priority
          />
          <motion.div
            className="absolute inset-0 h-20 w-auto rounded-full bg-yellow-400/20 blur-xl sm:h-24"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h1
          className="mb-6 inline-flex items-center text-5xl font-bold tracking-wide text-yellow-400 drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={loadingText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              {loadingText}
            </motion.span>
          </AnimatePresence>
          <motion.span
            className={cn(
              'ml-2 text-yellow-300 transition-opacity duration-200',
              showCursor ? 'opacity-100' : 'opacity-30'
            )}
            animate={{ opacity: showCursor ? 1 : 0.3 }}
            transition={{ duration: 0.2 }}
          >
            |
          </motion.span>
        </motion.h1>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h2
            className="text-2xl font-semibold text-white sm:text-3xl md:text-4xl"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 193, 7, 0.3)',
                '0 0 30px rgba(255, 193, 7, 0.5)',
                '0 0 20px rgba(255, 193, 7, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            HubEdu.ia
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-yellow-300 sm:text-xl md:text-2xl"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Estamos preparando algo incrível para você!
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 mt-8 flex space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-4 w-4 rounded-full bg-yellow-400 shadow-lg"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          [class*='animate-'] {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (max-width: 640px) {
          .text-8xl {
            font-size: 3rem;
          }
          .text-7xl {
            font-size: 2.5rem;
          }
          .text-6xl {
            font-size: 2rem;
          }
          .text-5xl {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ComingSoonPage
