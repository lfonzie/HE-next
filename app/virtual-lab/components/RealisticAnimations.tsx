// components/RealisticAnimations.tsx - Sistema de animações realistas
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface AnimationConfig {
  id: string;
  type: 'rotate' | 'pulse' | 'float' | 'pour' | 'mix' | 'heat' | 'stir' | 'bubble';
  duration: number;
  loop: boolean;
  intensity?: number;
  direction?: 'clockwise' | 'counterclockwise' | 'up' | 'down' | 'left' | 'right';
  color?: string;
}

interface RealisticAnimationsProps {
  animations: AnimationConfig[];
  isActive: boolean;
  onAnimationComplete?: (animationId: string) => void;
}

export const RealisticAnimations: React.FC<RealisticAnimationsProps> = ({
  animations,
  isActive,
  onAnimationComplete
}) => {
  const [activeAnimations, setActiveAnimations] = useState<AnimationConfig[]>([]);

  useEffect(() => {
    if (isActive) {
      setActiveAnimations(animations);
    } else {
      setActiveAnimations([]);
    }
  }, [animations, isActive]);

  const renderRotateAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        rotate: animation.direction === 'clockwise' ? 360 : -360
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "linear"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
    </motion.div>
  );

  const renderPulseAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div 
        className="w-full h-full rounded-full opacity-60"
        style={{ backgroundColor: animation.color || '#3b82f6' }}
      />
    </motion.div>
  );

  const renderFloatAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        y: animation.direction === 'up' ? [-5, 5, -5] : [5, -5, 5],
        x: animation.direction === 'left' ? [-3, 3, -3] : animation.direction === 'right' ? [3, -3, 3] : [0, 0, 0]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-30"></div>
    </motion.div>
  );

  const renderPourAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        rotate: [0, 45, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-40">
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );

  const renderMixAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        rotate: [0, 10, -10, 10, 0],
        scale: [1, 1.1, 0.9, 1.1, 1]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-50">
        <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );

  const renderHeatAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );

  const renderStirAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "linear"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-40">
        <div className="w-full h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );

  const renderBubbleAnimation = (animation: AnimationConfig) => (
    <motion.div
      key={animation.id}
      className="absolute inset-0 pointer-events-none"
      animate={{
        y: [-10, -50, -100],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 1.5]
      }}
      transition={{
        duration: animation.duration / 1000,
        repeat: animation.loop ? Infinity : 0,
        ease: "easeOut"
      }}
      onAnimationComplete={() => {
        if (!animation.loop) {
          onAnimationComplete?.(animation.id);
        }
      }}
    >
      <div className="w-4 h-4 bg-white rounded-full opacity-80 shadow-lg">
        <div className="w-2 h-2 bg-blue-200 rounded-full absolute top-1 left-1"></div>
      </div>
    </motion.div>
  );

  const renderAnimation = (animation: AnimationConfig) => {
    switch (animation.type) {
      case 'rotate':
        return renderRotateAnimation(animation);
      case 'pulse':
        return renderPulseAnimation(animation);
      case 'float':
        return renderFloatAnimation(animation);
      case 'pour':
        return renderPourAnimation(animation);
      case 'mix':
        return renderMixAnimation(animation);
      case 'heat':
        return renderHeatAnimation(animation);
      case 'stir':
        return renderStirAnimation(animation);
      case 'bubble':
        return renderBubbleAnimation(animation);
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <AnimatePresence>
        {activeAnimations.map(renderAnimation)}
      </AnimatePresence>
    </div>
  );
};

// Hook para gerenciar animações realistas
export const useRealisticAnimations = () => {
  const [animations, setAnimations] = useState<AnimationConfig[]>([]);
  const [isActive, setIsActive] = useState(false);

  const addAnimation = (animation: Omit<AnimationConfig, 'id'>) => {
    const newAnimation: AnimationConfig = {
      ...animation,
      id: `animation_${Date.now()}_${Math.random()}`
    };
    
    setAnimations(prev => [...prev, newAnimation]);
    
    // Remover animação após a duração se não for loop
    if (!animation.loop) {
      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
      }, animation.duration);
    }
  };

  const removeAnimation = (animationId: string) => {
    setAnimations(prev => prev.filter(a => a.id !== animationId));
  };

  const clearAnimations = () => {
    setAnimations([]);
  };

  const startRotation = (duration: number = 2000, direction: 'clockwise' | 'counterclockwise' = 'clockwise') => {
    addAnimation({
      type: 'rotate',
      duration,
      loop: true,
      direction
    });
  };

  const startPulse = (duration: number = 1000, color: string = '#3b82f6') => {
    addAnimation({
      type: 'pulse',
      duration,
      loop: true,
      color
    });
  };

  const startFloat = (duration: number = 2000, direction: 'up' | 'down' = 'up') => {
    addAnimation({
      type: 'float',
      duration,
      loop: true,
      direction
    });
  };

  const startPouring = (duration: number = 2000) => {
    addAnimation({
      type: 'pour',
      duration,
      loop: false
    });
  };

  const startMixing = (duration: number = 3000) => {
    addAnimation({
      type: 'mix',
      duration,
      loop: false
    });
  };

  const startHeating = (duration: number = 3000) => {
    addAnimation({
      type: 'heat',
      duration,
      loop: true
    });
  };

  const startStirring = (duration: number = 2000) => {
    addAnimation({
      type: 'stir',
      duration,
      loop: true
    });
  };

  const startBubbling = (duration: number = 1500) => {
    addAnimation({
      type: 'bubble',
      duration,
      loop: true
    });
  };

  return {
    animations,
    isActive,
    setIsActive,
    addAnimation,
    removeAnimation,
    clearAnimations,
    startRotation,
    startPulse,
    startFloat,
    startPouring,
    startMixing,
    startHeating,
    startStirring,
    startBubbling
  };
};
