
import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

const GRAVITY = 9.8;

export const PendulumLab: React.FC = () => {
  const [length, setLength] = useState<number>(150);
  const [initialAngle, setInitialAngle] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());
  const pendulumRef = useRef<HTMLDivElement>(null);

  const resetAnimation = () => {
    startTime.current = Date.now();
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const animate = () => {
      const elapsedTime = (Date.now() - startTime.current) / 1000;
      const period = 2 * Math.PI * Math.sqrt(length / (GRAVITY * 100)); // scale factor for pixels
      const angularFrequency = 2 * Math.PI / period;
      
      const dampingFactor = 0.1;
      const currentAngle = initialAngle * Math.cos(angularFrequency * elapsedTime) * Math.exp(-dampingFactor * elapsedTime);

      if (pendulumRef.current) {
        pendulumRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }

      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, length, initialAngle]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex justify-center items-center overflow-hidden relative pb-16">
        <div className="absolute top-0 left-1/2 w-px h-1/2 bg-slate-600/50"></div>
        <div ref={pendulumRef} className="relative transition-transform duration-0" style={{ transformOrigin: 'top center' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-400" style={{ height: `${length}px` }}></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-400 rounded-full shadow-lg" style={{ top: `${length}px` }}></div>
        </div>
      </div>
      <div className="w-full pt-4 border-t border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Slider
                label="Length"
                min="50"
                max="250"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                displayValue={`${length} px`}
            />
            <Slider
                label="Initial Angle"
                min="10"
                max="90"
                value={initialAngle}
                onChange={(e) => setInitialAngle(parseInt(e.target.value, 10))}
                displayValue={`${initialAngle}°`}
            />
            <div className="flex space-x-2 justify-self-center md:justify-self-end">
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={resetAnimation}>Reset</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
