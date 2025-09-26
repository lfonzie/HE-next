"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AudioVisualizerProps {
  audioContext: AudioContext;
  inputNode?: AudioNode;
  outputNode?: AudioNode;
  width?: number;
  height?: number;
  className?: string;
  showInput?: boolean;
  showOutput?: boolean;
}

export default function AudioVisualizer({
  audioContext,
  inputNode,
  outputNode,
  width = 400,
  height = 200,
  className = '',
  showInput = true,
  showOutput = true
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);
  
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  // Configurar analisadores de frequência
  useEffect(() => {
    if (!audioContext) return;

    if (inputNode && showInput) {
      const inputAnalyser = audioContext.createAnalyser();
      inputAnalyser.fftSize = 256;
      inputAnalyser.smoothingTimeConstant = 0.8;
      inputNode.connect(inputAnalyser);
      inputAnalyserRef.current = inputAnalyser;
    }

    if (outputNode && showOutput) {
      const outputAnalyser = audioContext.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyser.smoothingTimeConstant = 0.8;
      outputNode.connect(outputAnalyser);
      outputAnalyserRef.current = outputAnalyser;
    }

    setIsActive(true);

    return () => {
      if (inputAnalyserRef.current) {
        inputAnalyserRef.current.disconnect();
      }
      if (outputAnalyserRef.current) {
        outputAnalyserRef.current.disconnect();
      }
      setIsActive(false);
    };
  }, [audioContext, inputNode, outputNode, showInput, showOutput]);

  // Renderizar visualização
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Limpar canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Configurar estilo
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // Azul para input
    ctx.fillStyle = '#10b981'; // Verde para output

    // Desenhar visualização de input (se disponível)
    if (inputAnalyserRef.current && showInput) {
      const inputData = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
      inputAnalyserRef.current.getByteFrequencyData(inputData);

      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      
      const sliceWidth = canvasWidth / inputData.length;
      let x = 0;

      for (let i = 0; i < inputData.length; i++) {
        const v = inputData[i] / 255.0;
        const y = canvasHeight - (v * canvasHeight);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
    }

    // Desenhar visualização de output (se disponível)
    if (outputAnalyserRef.current && showOutput) {
      const outputData = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
      outputAnalyserRef.current.getByteFrequencyData(outputData);

      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      
      const sliceWidth = canvasWidth / outputData.length;
      let x = 0;

      for (let i = 0; i < outputData.length; i++) {
        const v = outputData[i] / 255.0;
        const y = canvasHeight - (v * canvasHeight);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
    }

    // Desenhar barras de frequência (alternativa)
    if (inputAnalyserRef.current && showInput) {
      const inputData = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
      inputAnalyserRef.current.getByteFrequencyData(inputData);

      const barWidth = canvasWidth / inputData.length;
      
      for (let i = 0; i < inputData.length; i++) {
        const barHeight = (inputData[i] / 255) * canvasHeight;
        
        // Gradiente de cor baseado na frequência
        const hue = (i / inputData.length) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        
        ctx.fillRect(i * barWidth, canvasHeight - barHeight, barWidth, barHeight);
      }
    }

    // Continuar animação
    animationFrameRef.current = requestAnimationFrame(renderVisualization);
  }, [isActive, showInput, showOutput]);

  // Iniciar/parar animação
  useEffect(() => {
    if (isActive) {
      renderVisualization();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, renderVisualization]);

  // Atualizar tamanho do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  return (
    <div className={`audio-visualizer ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full bg-gray-900 rounded-lg border border-gray-700"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {showInput && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Input
          </span>
        )}
        {showOutput && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Output
          </span>
        )}
      </div>
    </div>
  );
}

