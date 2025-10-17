// components/BenchCanvas.tsx - Canvas principal do laboratório
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LabItem, LabPosition, RendererConfig } from '../types/lab';
import { motion } from 'framer-motion';

interface BenchCanvasProps {
  items: LabItem[];
  layout: Array<{ itemId: string; x: number; y: number; rot?: number }>;
  config: RendererConfig;
  onItemMove: (itemId: string, position: LabPosition) => void;
  onItemSelect: (itemId: string) => void;
  selectedItemId?: string;
  isSimulating: boolean;
}

export const BenchCanvas: React.FC<BenchCanvasProps> = ({
  items,
  layout,
  config,
  onItemMove,
  onItemSelect,
  selectedItemId,
  isSimulating
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);

  // Renderizar canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar grid
    if (config.showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, config.gridSize, config.zoom);
    }

    // Desenhar bancada
    drawBench(ctx, canvas.width, canvas.height);

    // Desenhar itens
    items.forEach(item => {
      const itemLayout = layout.find(l => l.itemId === item.id);
      if (itemLayout) {
        drawItem(ctx, item, itemLayout, config, selectedItemId === item.id);
      }
    });

    // Desenhar conexões (se houver)
    drawConnections(ctx, items, layout);

  }, [items, layout, config, selectedItemId]);

  // Desenhar grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number, zoom: number) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([5, 5]);

    const scaledGridSize = gridSize * zoom;

    for (let x = 0; x < width; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  // Desenhar bancada
  const drawBench = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fundo da bancada
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Borda da bancada
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Área de trabalho
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 20, width - 40, height - 40);

    // Linhas de referência
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    
    // Linha central horizontal
    ctx.beginPath();
    ctx.moveTo(20, height / 2);
    ctx.lineTo(width - 20, height / 2);
    ctx.stroke();

    // Linha central vertical
    ctx.beginPath();
    ctx.moveTo(width / 2, 20);
    ctx.lineTo(width / 2, height - 20);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  // Desenhar item
  const drawItem = (
    ctx: CanvasRenderingContext2D,
    item: LabItem,
    layout: { itemId: string; x: number; y: number; rot?: number },
    config: RendererConfig,
    isSelected: boolean
  ) => {
    const x = layout.x * config.zoom + config.panX;
    const y = layout.y * config.zoom + config.panY;
    const size = 40 * config.zoom;

    ctx.save();
    ctx.translate(x, y);
    
    if (layout.rot) {
      ctx.rotate(layout.rot);
    }

    // Desenhar item baseado no tipo
    switch (item.kind) {
      case 'vessel':
        drawVessel(ctx, size, item.name, isSelected);
        break;
      case 'reagent':
        drawReagent(ctx, size, item.name, isSelected);
        break;
      case 'instrument':
        drawInstrument(ctx, size, item.name, isSelected);
        break;
      case 'physics':
        drawPhysicsElement(ctx, size, item.name, isSelected);
        break;
      default:
        drawGenericItem(ctx, size, item.name, isSelected);
    }

    ctx.restore();

    // Desenhar rótulo
    if (config.zoom > 0.5) {
      ctx.fillStyle = isSelected ? '#2563eb' : '#666666';
      ctx.font = `${12 * config.zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x, y + size + 15 * config.zoom);
    }
  };

  // Desenhar vidraria
  const drawVessel = (ctx: CanvasRenderingContext2D, size: number, name: string, isSelected: boolean) => {
    const radius = size / 2;
    
    // Corpo do recipiente
    ctx.fillStyle = isSelected ? '#dbeafe' : '#ffffff';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#cccccc';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Boca do recipiente
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 0.3);

    // Conteúdo (se houver)
    if (name.includes('HCl')) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(-radius * 0.6, -radius * 0.2, radius * 1.2, radius * 0.4);
    } else if (name.includes('NaOH')) {
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(-radius * 0.6, -radius * 0.2, radius * 1.2, radius * 0.4);
    }
  };

  // Desenhar reagente
  const drawReagent = (ctx: CanvasRenderingContext2D, size: number, name: string, isSelected: boolean) => {
    const radius = size / 2;
    
    ctx.fillStyle = isSelected ? '#fef3c7' : '#fbbf24';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#f59e0b';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Símbolo químico
    ctx.fillStyle = '#92400e';
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('R', 0, size * 0.1);
  };

  // Desenhar instrumento
  const drawInstrument = (ctx: CanvasRenderingContext2D, size: number, name: string, isSelected: boolean) => {
    const width = size;
    const height = size * 0.6;
    
    ctx.fillStyle = isSelected ? '#f3f4f6' : '#ffffff';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#6b7280';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Display do instrumento
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-width * 0.3, -height * 0.3, width * 0.6, height * 0.4);

    // Valor simulado
    ctx.fillStyle = '#10b981';
    ctx.font = `${size * 0.2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('7.2', 0, size * 0.05);
  };

  // Desenhar elemento de física
  const drawPhysicsElement = (ctx: CanvasRenderingContext2D, size: number, name: string, isSelected: boolean) => {
    if (name.includes('Resistor')) {
      drawResistor(ctx, size, isSelected);
    } else if (name.includes('Bateria')) {
      drawBattery(ctx, size, isSelected);
    } else if (name.includes('Lâmpada')) {
      drawLamp(ctx, size, isSelected);
    } else {
      drawGenericItem(ctx, size, name, isSelected);
    }
  };

  // Desenhar resistor
  const drawResistor = (ctx: CanvasRenderingContext2D, size: number, isSelected: boolean) => {
    const width = size;
    const height = size * 0.3;
    
    ctx.fillStyle = isSelected ? '#fef3c7' : '#fbbf24';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#f59e0b';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Faixas coloridas
    const bandWidth = width / 8;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-width / 2 + bandWidth, -height / 2, bandWidth, height);
    ctx.fillStyle = '#059669';
    ctx.fillRect(-width / 2 + bandWidth * 3, -height / 2, bandWidth, height);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(-width / 2 + bandWidth * 5, -height / 2, bandWidth, height);
  };

  // Desenhar bateria
  const drawBattery = (ctx: CanvasRenderingContext2D, size: number, isSelected: boolean) => {
    const width = size * 0.6;
    const height = size;
    
    ctx.fillStyle = isSelected ? '#f3f4f6' : '#ffffff';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#6b7280';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Terminal positivo
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-width * 0.1, -height / 2 - size * 0.1, width * 0.2, size * 0.1);

    // Terminal negativo
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-width * 0.1, height / 2, width * 0.2, size * 0.1);

    // Símbolo
    ctx.fillStyle = '#059669';
    ctx.font = `${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('+', 0, size * 0.1);
  };

  // Desenhar lâmpada
  const drawLamp = (ctx: CanvasRenderingContext2D, size: number, isSelected: boolean) => {
    const radius = size / 2;
    
    ctx.fillStyle = isSelected ? '#fef3c7' : '#fbbf24';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#f59e0b';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Filamento
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.3, -radius * 0.3);
    ctx.lineTo(radius * 0.3, radius * 0.3);
    ctx.moveTo(-radius * 0.3, radius * 0.3);
    ctx.lineTo(radius * 0.3, -radius * 0.3);
    ctx.stroke();
  };

  // Desenhar item genérico
  const drawGenericItem = (ctx: CanvasRenderingContext2D, size: number, name: string, isSelected: boolean) => {
    const radius = size / 2;
    
    ctx.fillStyle = isSelected ? '#e5e7eb' : '#f3f4f6';
    ctx.strokeStyle = isSelected ? '#2563eb' : '#9ca3af';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Ícone genérico
    ctx.fillStyle = '#6b7280';
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, size * 0.1);
  };

  // Desenhar conexões
  const drawConnections = (
    ctx: CanvasRenderingContext2D,
    items: LabItem[],
    layout: Array<{ itemId: string; x: number; y: number; rot?: number }>
  ) => {
    // Implementação simplificada - desenhar conexões entre itens próximos
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const item1 = layout[i];
        const item2 = layout[j];
        const distance = Math.sqrt(
          Math.pow(item2.x - item1.x, 2) + Math.pow(item2.y - item1.y, 2)
        );

        if (distance < 100) { // Conectar itens próximos
          ctx.beginPath();
          ctx.moveTo(item1.x, item1.y);
          ctx.lineTo(item2.x, item2.y);
          ctx.stroke();
        }
      }
    }

    ctx.setLineDash([]);
  };

  // Eventos de mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - config.panX) / config.zoom;
    const y = (e.clientY - rect.top - config.panY) / config.zoom;

    // Verificar se clicou em algum item
    const clickedItem = layout.find(item => {
      const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2));
      return distance < 20;
    });

    if (clickedItem) {
      setIsDragging(true);
      setDragItemId(clickedItem.itemId);
      setDragOffset({
        x: x - clickedItem.x,
        y: y - clickedItem.y
      });
      onItemSelect(clickedItem.itemId);
    } else {
      onItemSelect('');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragItemId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - config.panX) / config.zoom;
    const y = (e.clientY - rect.top - config.panY) / config.zoom;

    const newPosition = {
      x: x - dragOffset.x,
      y: y - dragOffset.y,
      rotation: 0
    };

    onItemMove(dragItemId, newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragItemId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - config.panX) / config.zoom;
    const y = (e.clientY - rect.top - config.panY) / config.zoom;

    const clickedItem = layout.find(item => {
      const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2));
      return distance < 20;
    });

    if (clickedItem) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        itemId: clickedItem.itemId
      });
    }
  };

  // Renderizar quando necessário
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={config.canvasWidth}
        height={config.canvasHeight}
        className="border border-gray-300 rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
      
      {/* Indicador de simulação */}
      {isSimulating && (
        <motion.div
          className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🔬 Simulando...
        </motion.div>
      )}

      {/* Menu de contexto */}
      {contextMenu && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-10"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Propriedades
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Remover
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Rotacionar
          </button>
        </div>
      )}
    </div>
  );
};
