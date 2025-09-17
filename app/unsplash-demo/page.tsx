// app/unsplash-demo/page.tsx
'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { UnsplashImagePicker } from '@/components/ui/UnsplashImagePicker';
import { UnsplashImageSearch } from '@/components/ui/UnsplashImageSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnsplashImage } from '@/lib/unsplash';
import { Image as ImageIcon, Download, ExternalLink, Heart, User } from 'lucide-react';

export default function UnsplashDemoPage() {
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');

  const handleImageSelect = (image: UnsplashImage) => {
    setSelectedImage(image);
  };

  const handleImageSelectUrl = (url: string, alt: string) => {
    setSelectedImageUrl(url);
    setSelectedImageAlt(alt);
  };

  const handleDownloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage.urls.full;
      link.download = `unsplash-${selectedImage.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Integração com Unsplash</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Demonstração da integração com a API do Unsplash para buscar e selecionar imagens 
          de alta qualidade para uso em apresentações, documentos e materiais educacionais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seletor de Imagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Seletor de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use o botão abaixo para abrir o seletor de imagens do Unsplash:
            </p>
            
            <UnsplashImagePicker
              onImageSelect={handleImageSelect}
              onImageSelectUrl={handleImageSelectUrl}
              trigger={
                <Button className="w-full gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Escolher Imagem do Unsplash
                </Button>
              }
            />

            <div className="text-xs text-muted-foreground">
              <p>• Busque por qualquer termo</p>
              <p>• Explore categorias de educação</p>
              <p>• Encontre imagens para apresentações</p>
              <p>• Todas as imagens são gratuitas para uso</p>
            </div>
          </CardContent>
        </Card>

        {/* Busca Avançada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Busca Avançada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnsplashImageSearch
              onImageSelect={handleImageSelect}
              onImageSelectUrl={handleImageSelectUrl}
              className="max-h-96 overflow-y-auto"
            />
          </CardContent>
        </Card>
      </div>

      {/* Imagem Selecionada */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagem Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg">
                  <Image
        src={selectedImage.urls.regular}
        alt={selectedImage.alt_description || selectedImage.description || 'Imagem selecionada'}
        width={500}
        height={300}
        className={""}
        loading={"lazy"}
      />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleDownloadImage} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Original
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(selectedImage.urls.full, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no Unsplash
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Informações da Imagem</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Heart className="h-3 w-3 mr-1" />
                        {selectedImage.likes} curtidas
                      </Badge>
                      <Badge variant="outline">
                        {selectedImage.width} × {selectedImage.height}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {selectedImage.user.name} (@{selectedImage.user.username})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Descrição</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.alt_description || selectedImage.description || 'Sem descrição disponível'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">URLs Disponíveis</h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">Thumbnail:</span>
                      <code className="ml-2 bg-muted px-1 rounded">
                        {selectedImage.urls.thumb}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Pequena:</span>
                      <code className="ml-2 bg-muted px-1 rounded">
                        {selectedImage.urls.small}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Regular:</span>
                      <code className="ml-2 bg-muted px-1 rounded">
                        {selectedImage.urls.regular}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Completa:</span>
                      <code className="ml-2 bg-muted px-1 rounded">
                        {selectedImage.urls.full}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre o Unsplash */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Unsplash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">O que é o Unsplash?</h3>
              <p className="text-sm text-muted-foreground">
                Unsplash é uma plataforma de fotos gratuitas de alta qualidade. 
                Todas as imagens podem ser usadas gratuitamente para projetos pessoais e comerciais.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Como usar?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Busque por termos relacionados ao seu conteúdo</li>
                <li>• Use as categorias pré-definidas (Educação, Apresentações)</li>
                <li>• Clique na imagem para selecioná-la</li>
                <li>• Baixe a imagem ou copie a URL</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Termos de Uso</h3>
            <p className="text-sm text-muted-foreground">
              As imagens do Unsplash são gratuitas para uso comercial e não comercial. 
              Não é necessário atribuição, mas é apreciado quando possível. 
              Para mais informações, visite{' '}
              <a 
                href="https://unsplash.com/license" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                unsplash.com/license
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
