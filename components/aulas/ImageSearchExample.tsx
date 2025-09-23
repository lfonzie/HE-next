import React from 'react';
import { ImageSelector } from '@/components/aulas/ImageSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Exemplo de uso do ImageSelector melhorado
 * Demonstra como usar as sugestões contextuais por disciplina
 */
export function ImageSearchExample() {
  const [selectedImages, setSelectedImages] = React.useState([]);

  const handleImageSelect = (image) => {
    setSelectedImages(prev => [...prev, image]);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo: Busca para Física</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageSelector
            onImageSelect={handleImageSelect}
            selectedImages={selectedImages}
            maxImages={5}
            subject="física"
          />
          <p className="text-sm text-muted-foreground mt-2">
            💡 Com subject="física", você verá sugestões específicas como "terremoto", "vulcão", "gravidade", etc.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo: Busca para Biologia</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageSelector
            onImageSelect={handleImageSelect}
            selectedImages={selectedImages}
            maxImages={5}
            subject="biologia"
          />
          <p className="text-sm text-muted-foreground mt-2">
            💡 Com subject="biologia", você verá sugestões como "célula", "DNA", "fotossíntese", etc.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo: Busca Geral (sem disciplina específica)</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageSelector
            onImageSelect={handleImageSelect}
            selectedImages={selectedImages}
            maxImages={5}
          />
          <p className="text-sm text-muted-foreground mt-2">
            💡 Sem subject, você verá sugestões populares gerais.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona a melhoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">1. Extração de Termos Principais</h4>
            <p className="text-sm text-muted-foreground">
              "física do terremoto" → extrai "terremoto" como termo principal
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Consultas Otimizadas</h4>
            <p className="text-sm text-muted-foreground">
              Cria múltiplas consultas: ["terremoto", "earthquake", "sismo"] para melhor cobertura
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Rerank Semântico</h4>
            <p className="text-sm text-muted-foreground">
              Usa o termo principal para reranking, priorizando imagens mais relevantes
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Sugestões Contextuais</h4>
            <p className="text-sm text-muted-foreground">
              Mostra sugestões específicas da disciplina para facilitar a busca
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImageSearchExample;
