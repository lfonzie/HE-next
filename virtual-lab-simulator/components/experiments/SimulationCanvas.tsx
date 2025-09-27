import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';

type Granulometria = 'muito_fino' | 'fino' | 'medio' | 'grosso';

interface EfeitoVisual {
  tipo_efeito: string;
  cor_hex?: string;
  duracao_segundos?: number;
  intensidade_normalizada?: number;
  granulometria?: Granulometria;
}

interface EventoCronologico {
  tempo_inicio: number;
  efeitos_visuais: EfeitoVisual[];
}

interface Timeline {
  duracao_total_segundos: number;
}

interface SimulationCanvasProps {
  events: EventoCronologico[];
  timeline: Timeline;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  type: 'bubble' | 'precipitate';
  vx: number;
  vy: number;
}

const GRANULOMETRIA_MAP: Record<Granulometria, number> = {
  muito_fino: 1,
  fino: 2,
  medio: 3.5,
  grosso: 5,
};

const MAX_PARTICLES_PER_SECOND = 50; // Base rate for intensity = 1.0

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ events, timeline }) => {
  const [liquidColor, setLiquidColor] = useState('#67e8f9'); // cyan-300
  const [transitionDuration, setTransitionDuration] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [progress, setProgress] = useState(0);

  const animationStartTimeRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Main animation loop for particles and progress
  useEffect(() => {
    const totalDuration = timeline?.duracao_total_segundos ? timeline.duracao_total_segundos * 1000 : 0;

    const animate = () => {
      // Update progress bar
      if (totalDuration > 0) {
          const elapsedTime = Date.now() - (animationStartTimeRef.current || Date.now());
          const currentProgress = Math.min(elapsedTime / totalDuration, 1);
          setProgress(currentProgress * 100);
      }

      // Update particles
      setParticles(prevParticles => 
        prevParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.005, // Fade out
          }))
          .filter(p => p.opacity > 0 && p.y > 20 && p.y < 108) // Remove if faded or out of bounds
      );

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [timeline]);


  // Event scheduling
  useEffect(() => {
    if (!events || events.length === 0) return;

    // Reset state for new simulation
    setLiquidColor('#67e8f9');
    setTransitionDuration(1);
    setParticles([]);
    setProgress(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    animationStartTimeRef.current = Date.now();
    
    events.forEach(event => {
      const eventTimeoutId = setTimeout(() => {
        event.efeitos_visuais.forEach(effect => {
          if (effect.tipo_efeito === 'mudanca_cor' && effect.cor_hex) {
            const validColor = /^#[0-9A-F]{6}$/i.test(effect.cor_hex) ? effect.cor_hex : '#FFFFFF';
            setTransitionDuration(effect.duracao_segundos || 1);
            setLiquidColor(validColor);
          }
          
          if (effect.tipo_efeito === 'bolhas' || effect.tipo_efeito === 'precipitacao') {
            const {
                intensidade_normalizada = 0.5,
                granulometria = 'fino',
                duracao_segundos = 3,
                cor_hex = '#FFFFFF'
            } = effect;

            const particlesPerSecond = intensidade_normalizada * MAX_PARTICLES_PER_SECOND;
            const intervalMs = 1000 / particlesPerSecond;

            const generatorInterval = setInterval(() => {
                const newParticle: Particle = {
                    id: Math.random(),
                    x: 20 + Math.random() * 60, // random x within liquid
                    y: effect.tipo_efeito === 'bolhas' ? 108 : 30 + Math.random() * 20, // bottom for bubbles, top for precipitate
                    size: GRANULOMETRIA_MAP[granulometria] * (0.8 + Math.random() * 0.4),
                    opacity: 0.8 + Math.random() * 0.2,
                    color: effect.tipo_efeito === 'bolhas' ? 'rgba(255,255,255,0.7)' : cor_hex,
                    type: effect.tipo_efeito === 'bolhas' ? 'bubble' : 'precipitate',
                    vx: (Math.random() - 0.5) * 0.2, // slight horizontal drift
                    vy: effect.tipo_efeito === 'bolhas' ? -0.3 - Math.random() * 0.5 : 0.2 + Math.random() * 0.3,
                };
                setParticles(prev => [...prev.slice(-100), newParticle]); // Add new particle, limit array size
            }, intervalMs);

            intervals.push(generatorInterval);
            
            const stopTimeout = setTimeout(() => {
                clearInterval(generatorInterval);
            }, duracao_segundos * 1000);
            timeouts.push(stopTimeout);
          }
        });
      }, event.tempo_inicio * 1000);
      timeouts.push(eventTimeoutId);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [events, timeline]);

  return (
    <Card className="h-64 flex flex-col justify-center items-center relative overflow-hidden p-0">
      <div className="w-full h-full flex justify-center items-center">
        <div className="absolute w-40 h-48 bottom-4">
          <svg viewBox="0 0 100 120" className="w-full h-full" style={{ overflow: 'hidden' }}>
            <path d="M10 110 H 90 V 20 L 80 10 H 20 L 10 20 V 110 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <rect x="12" y="30" width="76" height="78" style={{ fill: liquidColor, transition: `fill ${transitionDuration}s ease-in-out` }} />
            
            {/* Render Particles */}
            <g>
              {particles.map(p => (
                <circle 
                  key={p.id}
                  cx={p.x}
                  cy={p.y}
                  r={p.size}
                  fill={p.color}
                  fillOpacity={p.opacity}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
        <div 
          className="h-full bg-cyan-400" 
          style={{ width: `${progress}%`, transition: progress > 1 ? 'width 0.1s linear' : 'none' }}
        ></div>
      </div>
    </Card>
  );
};