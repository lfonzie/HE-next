// components/ui/UnsplashImagePicker.tsx
'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Download, ExternalLink, Heart } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { UnsplashImageSearch } from './UnsplashImageSearch';
import { UnsplashImage } from '@/lib/unsplash';

interface UnsplashImagePickerProps {
  onImageSelect?: (image: UnsplashImage) => void;
  onImageSelectUrl?: (url: string, alt: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function UnsplashImagePicker({ 
  onImageSelect, 
  onImageSelectUrl, 
  trigger,
  className = '' 
}: UnsplashImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  const handleImageSelect = (image: UnsplashImage) => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      if (onImageSelect) {
        onImageSelect(selectedImage);
      }
      if (onImageSelectUrl) {
        onImageSelectUrl(
          selectedImage.urls.regular, 
          selectedImage.alt_description || selectedImage.description || 'Imagem do Unsplash'
        );
      }
      setOpen(false);
      setSelectedImage(null);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <ImageIcon className="h-4 w-4" />
      Escolher Imagem
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Escolher Imagem do Unsplash
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto">
            <UnsplashImageSearch 
              onImageSelect={handleImageSelect}
              className="h-full"
            />
          </div>

          {selectedImage && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="relative w-20 h-20 overflow-hidden rounded-md">
                  <img
                    src={selectedImage.urls.small}
                    alt={selectedImage.alt_description || 'Imagem selecionada'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      {selectedImage.likes}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedImage.width} × {selectedImage.height}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedImage.alt_description || selectedImage.description || 'Sem descrição'}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Foto por {selectedImage.user.name} (@{selectedImage.user.username})
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedImage.urls.full, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Original
                  </Button>
                  
                  <Button
                    onClick={handleConfirmSelection}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Usar Imagem
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
