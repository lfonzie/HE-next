// components/LiquidEffects.tsx - Efeitos visuais para líquidos e reações
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidEffect {
  id: string;
  type: 'pour' | 'mix' | 'bubble' | 'precipitate' | 'color-change' | 'heat';
  position: { x: number; y: number };
  duration: number;
  color?: string;
  intensity?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface LiquidEffectsProps {
  effects: LiquidEffect[];
  isActive: boolean;
  onEffectComplete?: (effectId: string) => void;
}

export const LiquidEffects: React.FC<LiquidEffectsProps> = ({
  effects,
  isActive,
  onEffectComplete
}) => {
  const [activeEffects, setActiveEffects] = useState<LiquidEffect[]>([]);

  useEffect(() => {
    if (isActive) {
      setActiveEffects(effects);
    } else {
      setActiveEffects([]);
    }
  }, [effects, isActive]);

  const renderPourEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x,
        top: effect.position.y,
        width: 20,
        height: 20
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: effect.direction === 'down' ? [0, 100] : [0, -100]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div className="w-full h-full bg-blue-400 rounded-full opacity-80">
        <div className="w-full h-full bg-blue-300 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );

  const renderMixEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x - 25,
        top: effect.position.y - 25,
        width: 50,
        height: 50
      }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        rotate: [0, 360, 720, 0],
        scale: [0.8, 1.2, 1, 0.8]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeInOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );

  const renderBubbleEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x,
        top: effect.position.y
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.2, 0],
        y: [0, -50, -100]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div className="w-4 h-4 bg-white rounded-full opacity-80 shadow-lg">
        <div className="w-2 h-2 bg-blue-200 rounded-full absolute top-1 left-1"></div>
      </div>
    </motion.div>
  );

  const renderPrecipitateEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x - 10,
        top: effect.position.y - 10,
        width: 20,
        height: 20
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: [0, 20, 40]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div className="w-full h-full bg-gray-300 rounded-full opacity-90">
        <div className="w-full h-full bg-gray-400 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );

  const renderColorChangeEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x - 15,
        top: effect.position.y - 15,
        width: 30,
        height: 30
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1, 0]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div 
        className="w-full h-full rounded-full opacity-70"
        style={{ backgroundColor: effect.color || '#ff6b6b' }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-50 animate-pulse"></div>
      </div>
    </motion.div>
  );

  const renderHeatEffect = (effect: LiquidEffect) => (
    <motion.div
      key={effect.id}
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x - 20,
        top: effect.position.y - 20,
        width: 40,
        height: 40
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.2, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: effect.duration / 1000,
        ease: "easeOut"
      }}
      onAnimationComplete={() => onEffectComplete?.(effect.id)}
    >
      <div className="w-full h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );

  const renderEffect = (effect: LiquidEffect) => {
    switch (effect.type) {
      case 'pour':
        return renderPourEffect(effect);
      case 'mix':
        return renderMixEffect(effect);
      case 'bubble':
        return renderBubbleEffect(effect);
      case 'precipitate':
        return renderPrecipitateEffect(effect);
      case 'color-change':
        return renderColorChangeEffect(effect);
      case 'heat':
        return renderHeatEffect(effect);
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {activeEffects.map(renderEffect)}
      </AnimatePresence>
    </div>
  );
};

// Hook para gerenciar efeitos de líquido
export const useLiquidEffects = () => {
  const [effects, setEffects] = useState<LiquidEffect[]>([]);
  const [isActive, setIsActive] = useState(false);

  const addEffect = (effect: Omit<LiquidEffect, 'id'>) => {
    const newEffect: LiquidEffect = {
      ...effect,
      id: `effect_${Date.now()}_${Math.random()}`
    };
    
    setEffects(prev => [...prev, newEffect]);
    
    // Remover efeito após a duração
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, effect.duration);
  };

  const clearEffects = () => {
    setEffects([]);
  };

  const startPouring = (position: { x: number; y: number }, direction: 'down' | 'up' = 'down') => {
    addEffect({
      type: 'pour',
      position,
      duration: 2000,
      direction
    });
  };

  const startMixing = (position: { x: number; y: number }) => {
    addEffect({
      type: 'mix',
      position,
      duration: 3000,
      intensity: 0.8
    });
  };

  const startBubbling = (position: { x: number; y: number }) => {
    addEffect({
      type: 'bubble',
      position,
      duration: 1500
    });
  };

  const startPrecipitation = (position: { x: number; y: number }) => {
    addEffect({
      type: 'precipitate',
      position,
      duration: 2500
    });
  };

  const startColorChange = (position: { x: number; y: number }, color: string) => {
    addEffect({
      type: 'color-change',
      position,
      duration: 2000,
      color
    });
  };

  const startHeating = (position: { x: number; y: number }) => {
    addEffect({
      type: 'heat',
      position,
      duration: 3000
    });
  };

  return {
    effects,
    isActive,
    setIsActive,
    addEffect,
    clearEffects,
    startPouring,
    startMixing,
    startBubbling,
    startPrecipitation,
    startColorChange,
    startHeating
  };
};
