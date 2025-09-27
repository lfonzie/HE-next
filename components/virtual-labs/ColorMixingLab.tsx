'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Palette, RotateCcw, Eye, Lightbulb } from 'lucide-react';

interface ColorMixingLabProps {}

export const ColorMixingLab: React.FC<ColorMixingLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [cyan, setCyan] = useState(0);
  const [magenta, setMagenta] = useState(255);
  const [yellow, setYellow] = useState(255);
  const [colorMode, setColorMode] = useState<'rgb' | 'cmyk'>('rgb');
  const [selectedColor, setSelectedColor] = useState('#ff0000');

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  const cmykToRgb = (c: number, m: number, y: number, k: number) => {
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return { r, g, b };
  };

  const getCurrentColor = () => {
    if (colorMode === 'rgb') {
      return { r: red, g: green, b: blue };
    } else {
      return cmykToRgb(cyan / 100, magenta / 100, yellow / 100, 0);
    }
  };

  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 0.5) * Math.PI / 180;
      const endAngle = (angle + 0.5) * Math.PI / 180;
      
      const hue = angle;
      const saturation = 100;
      const lightness = 50;
      
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
    }

    // Draw center circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();

    // Draw current color in center
    const currentColor = getCurrentColor();
    ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
    ctx.fill();

    // Draw color info
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`RGB: ${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}`, centerX, centerY - 10);
    
    const hsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
    ctx.fillText(`HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, centerX, centerY + 10);
    
    const hex = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
    ctx.fillText(`HEX: ${hex}`, centerX, centerY + 30);
  };

  const resetColors = () => {
    if (colorMode === 'rgb') {
      setRed(255);
      setGreen(0);
      setBlue(0);
    } else {
      setCyan(0);
      setMagenta(255);
      setYellow(255);
    }
  };

  const randomizeColors = () => {
    if (colorMode === 'rgb') {
      setRed(Math.floor(Math.random() * 256));
      setGreen(Math.floor(Math.random() * 256));
      setBlue(Math.floor(Math.random() * 256));
    } else {
      setCyan(Math.floor(Math.random() * 101));
      setMagenta(Math.floor(Math.random() * 101));
      setYellow(Math.floor(Math.random() * 101));
    }
  };

  useEffect(() => {
    drawColorWheel();
  }, [red, green, blue, cyan, magenta, yellow, colorMode]);

  const currentColor = getCurrentColor();
  const hsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
  const hex = rgbToHex(currentColor.r, currentColor.g, currentColor.b);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Simulação de Mistura de Cores</span>
            </CardTitle>
            <CardDescription>
              Explore a teoria das cores e diferentes modelos de cor
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full h-full border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Controles de Cor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Button
                onClick={() => setColorMode('rgb')}
                variant={colorMode === 'rgb' ? 'default' : 'outline'}
                size="sm"
              >
                RGB
              </Button>
              <Button
                onClick={() => setColorMode('cmyk')}
                variant={colorMode === 'cmyk' ? 'default' : 'outline'}
                size="sm"
              >
                CMYK
              </Button>
            </div>

            {colorMode === 'rgb' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Vermelho: {red}
                  </label>
                  <Slider
                    value={[red]}
                    onValueChange={(value) => setRed(value[0])}
                    min={0}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Verde: {green}
                  </label>
                  <Slider
                    value={[green]}
                    onValueChange={(value) => setGreen(value[0])}
                    min={0}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Azul: {blue}
                  </label>
                  <Slider
                    value={[blue]}
                    onValueChange={(value) => setBlue(value[0])}
                    min={0}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ciano: {cyan}%
                  </label>
                  <Slider
                    value={[cyan]}
                    onValueChange={(value) => setCyan(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Magenta: {magenta}%
                  </label>
                  <Slider
                    value={[magenta]}
                    onValueChange={(value) => setMagenta(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Amarelo: {yellow}%
                  </label>
                  <Slider
                    value={[yellow]}
                    onValueChange={(value) => setYellow(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={resetColors}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button
                onClick={randomizeColors}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Aleatório
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Cores Primárias</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500 rounded mx-auto mb-1" />
                  <span className="text-xs">Vermelho</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded mx-auto mb-1" />
                  <span className="text-xs">Verde</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded mx-auto mb-1" />
                  <span className="text-xs">Azul</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Cor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(currentColor.r)}</div>
              <div className="text-sm text-gray-600">Vermelho</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(currentColor.g)}</div>
              <div className="text-sm text-gray-600">Verde</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(currentColor.b)}</div>
              <div className="text-sm text-gray-600">Azul</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{hex}</div>
              <div className="text-sm text-gray-600">HEX</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>RGB:</strong> Modelo aditivo usado em monitores e telas
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>CMYK:</strong> Modelo subtrativo usado em impressão
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>HSL:</strong> Representação por matiz, saturação e luminosidade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
