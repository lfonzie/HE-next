// components/RealisticRenderer.tsx - Renderizador com gráficos realistas
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REALISTIC_SPRITES, getSpriteById, VISUAL_EFFECTS, ANIMATIONS } from '../assets/sprites';
import { LabItem, LabPosition } from '../types/lab';

interface RealisticRendererProps {
  items: LabItem[];
  layout: Array<{ itemId: string; x: number; y: number; rot?: number }>;
  onItemClick?: (itemId: string) => void;
  onItemRightClick?: (event: React.MouseEvent, itemId: string) => void;
  selectedItemId?: string;
  isSimulating?: boolean;
  className?: string;
}

interface SpriteImage {
  id: string;
  image: HTMLImageElement;
  loaded: boolean;
  error: boolean;
}

export const RealisticRenderer: React.FC<RealisticRendererProps> = ({
  items,
  layout,
  onItemClick,
  onItemRightClick,
  selectedItemId,
  isSimulating = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spriteImages, setSpriteImages] = useState<Map<string, SpriteImage>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar imagens dos sprites
  useEffect(() => {
    const loadSprites = async () => {
      const imageMap = new Map<string, SpriteImage>();
      let loadedCount = 0;
      const totalSprites = REALISTIC_SPRITES.length;

      for (const sprite of REALISTIC_SPRITES) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const spriteImage: SpriteImage = {
          id: sprite.id,
          image: img,
          loaded: false,
          error: false
        };

        img.onload = () => {
          spriteImage.loaded = true;
          loadedCount++;
          setLoadingProgress((loadedCount / totalSprites) * 100);
          
          if (loadedCount === totalSprites) {
            setIsLoading(false);
          }
        };

        img.onerror = () => {
          spriteImage.error = true;
          loadedCount++;
          setLoadingProgress((loadedCount / totalSprites) * 100);
          
          if (loadedCount === totalSprites) {
            setIsLoading(false);
          }
        };

        img.src = sprite.imageUrl;
        imageMap.set(sprite.id, spriteImage);
      }

      setSpriteImages(imageMap);
    };

    loadSprites();
  }, []);

  // Renderizar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar grid de fundo
    drawGrid(ctx, canvas.width, canvas.height);

    // Desenhar itens
    layout.forEach(({ itemId, x, y, rot = 0 }) => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const sprite = getSpriteById(itemId);
      if (!sprite) return;

      const spriteImage = spriteImages.get(sprite.id);
      if (!spriteImage || !spriteImage.loaded) return;

      drawItem(ctx, sprite, spriteImage.image, x, y, rot, itemId === selectedItemId);
    });

    // Desenhar efeitos de simulação
    if (isSimulating) {
      drawSimulationEffects(ctx, canvas.width, canvas.height);
    }

  }, [items, layout, selectedItemId, isSimulating, spriteImages, isLoading]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawItem = (
    ctx: CanvasRenderingContext2D,
    sprite: any,
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    isSelected: boolean
  ) => {
    ctx.save();

    // Aplicar transformações
    ctx.translate(x + sprite.width / 2, y + sprite.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Desenhar sombra
    if (sprite.shadow) {
      ctx.save();
      ctx.translate(VISUAL_EFFECTS.shadow.offsetX, VISUAL_EFFECTS.shadow.offsetY);
      ctx.globalAlpha = 0.3;
      ctx.filter = `blur(${VISUAL_EFFECTS.shadow.blur}px)`;
      ctx.drawImage(
        image,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
      );
      ctx.restore();
    }

    // Desenhar item principal
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.drawImage(
      image,
      -sprite.width / 2,
      -sprite.height / 2,
      sprite.width,
      sprite.height
    );

    // Desenhar brilho se selecionado
    if (isSelected) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        -sprite.width / 2 - 2,
        -sprite.height / 2 - 2,
        sprite.width + 4,
        sprite.height + 4
      );
    }

    // Desenhar efeito de brilho para instrumentos
    if (sprite.glow) {
      ctx.shadowColor = VISUAL_EFFECTS.glow.color;
      ctx.shadowBlur = VISUAL_EFFECTS.glow.radius;
      ctx.globalAlpha = VISUAL_EFFECTS.glow.intensity;
      ctx.drawImage(
        image,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
      );
    }

    ctx.restore();
  };

  const drawSimulationEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Desenhar partículas de simulação
    ctx.fillStyle = '#60a5fa';
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verificar se clicou em algum item
    layout.forEach(({ itemId, x: itemX, y: itemY }) => {
      const sprite = getSpriteById(itemId);
      if (!sprite) return;

      if (
        x >= itemX &&
        x <= itemX + sprite.width &&
        y >= itemY &&
        y <= itemY + sprite.height
      ) {
        onItemClick?.(itemId);
      }
    });
  };

  const handleCanvasRightClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verificar se clicou em algum item
    layout.forEach(({ itemId, x: itemX, y: itemY }) => {
      const sprite = getSpriteById(itemId);
      if (!sprite) return;

      if (
        x >= itemX &&
        x <= itemX + sprite.width &&
        y >= itemY &&
        y <= itemY + sprite.height
      ) {
        onItemRightClick?.(event, itemId);
      }
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gráficos realistas...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">{Math.round(loadingProgress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        className="border border-gray-300 rounded-lg shadow-lg cursor-pointer"
        style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          imageRendering: 'auto'
        }}
      />
      
      {/* Overlay de informações */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            {isSimulating ? 'Simulando...' : 'Pronto'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {items.length} itens na bancada
        </p>
      </div>

      {/* Legenda de cores */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded animate-pulse"></div>
            <span>Instrumento Ativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Reagente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
