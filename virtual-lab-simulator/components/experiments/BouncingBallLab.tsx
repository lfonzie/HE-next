import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

const GRAVITY = 0.5; // Acceleration due to gravity (pixels per frame^2)
const INITIAL_HEIGHT = 10; // Starting height in pixels from the top

export const BouncingBallLab: React.FC = () => {
    const [restitution, setRestitution] = useState<number>(0.85); // Bounciness
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const ballRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number | null>(null);

    const position = useRef<number>(INITIAL_HEIGHT);
    const velocity = useRef<number>(0);

    const resetBall = () => {
        position.current = INITIAL_HEIGHT;
        velocity.current = 0;
        if (ballRef.current) {
            ballRef.current.classList.remove('squash', 'stretch');
        }
        if (!isPlaying) {
            setIsPlaying(true);
        }
    };
    
    useEffect(() => {
        const animate = () => {
            if (!containerRef.current || !ballRef.current) {
                animationFrameId.current = requestAnimationFrame(animate);
                return;
            }

            const floor = containerRef.current.clientHeight - ballRef.current.clientHeight;

            velocity.current += GRAVITY;
            position.current += velocity.current;
            
            ballRef.current.classList.remove('squash');

            if (position.current >= floor) {
                position.current = floor;
                velocity.current *= -restitution;
                
                ballRef.current.classList.add('squash');
                
                if (Math.abs(velocity.current) < 1) {
                    velocity.current = 0;
                    position.current = floor;
                    setIsPlaying(false);
                }
            }
            
            ballRef.current.style.transform = `translateY(${position.current}px)`;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, restitution]);


    return (
        <div className="flex flex-col h-full">
            <style>{`
                .ball-squash { transition: transform 0.1s ease-out; }
                .squash { transform-origin: bottom; animation: squash 0.2s ease-out; }
                @keyframes squash {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15, 0.85); }
                    100% { transform: scale(1); }
                }
            `}</style>
            <div ref={containerRef} className="flex-1 w-full flex justify-center items-start border-b-4 border-slate-500 bg-black/20 rounded-t-lg relative overflow-hidden">
                <div 
                    ref={ballRef} 
                    className="w-10 h-10 rounded-full shadow-lg" 
                    style={{ 
                        transform: `translateY(${position.current}px)`,
                        background: 'radial-gradient(circle at 12px 12px, #67e8f9, #0891b2)',
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))'
                    }}>
                </div>
            </div>
            <div className="w-full pt-4 mt-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <Slider
                        label="Elasticidade (Restituição)"
                        min="0.1"
                        max="0.95"
                        step="0.01"
                        value={restitution}
                        onChange={(e) => setRestitution(parseFloat(e.target.value))}
                        displayValue={restitution.toFixed(2)}
                    />
                     <div className="flex space-x-2 justify-self-center md:justify-self-end">
                        <Button onClick={() => setIsPlaying(!isPlaying)} disabled={velocity.current === 0 && position.current > INITIAL_HEIGHT}>
                        {isPlaying ? 'Pausar' : 'Iniciar'}
                        </Button>
                        <Button onClick={resetBall}>Resetar</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
