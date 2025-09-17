'use client';

import React, { useState } from 'react';
import HubEduLessonModule from '@/components/professor-interactive/lesson/HubEduLessonModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Complete Photosynthesis example as provided in the requirements
const PHOTOSYNTHESIS_EXAMPLE = [
  {
    "slide": 1,
    "title": "What is Photosynthesis?",
    "type": "explanation",
    "content": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. Using sunlight, carbon dioxide from the air, and water from the soil, plants produce glucose and release oxygen as a byproduct. This process is essential for life, providing energy for plants and oxygen for other organisms.",
    "image_prompt": "green leaf under sunlight with a bright background"
  },
  {
    "slide": 2,
    "title": "The Photosynthesis Equation",
    "type": "explanation",
    "content": "The chemical equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This shows how six molecules of carbon dioxide and six molecules of water, powered by sunlight, produce one molecule of glucose and six molecules of oxygen. For example, a sunflower uses this process to grow and produce energy.",
    "image_prompt": "sunflower in a field absorbing sunlight"
  },
  {
    "slide": 3,
    "title": "Key Components of Photosynthesis",
    "type": "explanation",
    "content": "Photosynthesis occurs in chloroplasts, where chlorophyll absorbs sunlight. It involves two stages: light-dependent reactions, which produce energy molecules (ATP and NADPH), and light-independent reactions (Calvin cycle), which use these molecules to form glucose. Variations exist, like C4 and CAM photosynthesis, adapted to different environments, such as deserts.",
    "image_prompt": "close-up of a plant cell showing chloroplasts"
  },
  {
    "slide": 4,
    "title": "What Drives Photosynthesis?",
    "type": "question",
    "content": "What is the primary energy source for photosynthesis?",
    "options": [
      "A) Soil nutrients",
      "B) Sunlight",
      "C) Oxygen",
      "D) Glucose"
    ],
    "answer": "B",
    "image_prompt": "sun shining through green leaves"
  },
  {
    "slide": 5,
    "title": "Role of Chlorophyll",
    "type": "explanation",
    "content": "Chlorophyll, the green pigment in plants, captures sunlight during photosynthesis. It absorbs blue and red light but reflects green, giving plants their color. This pigment is found in the thylakoid membranes of chloroplasts. By absorbing light, chlorophyll energizes electrons, initiating the process that converts light energy into chemical energy for glucose production.",
    "image_prompt": "microscopic view of chlorophyll in plant cells"
  },
  {
    "slide": 6,
    "title": "Photosynthesis in the Real World",
    "type": "explanation",
    "content": "Photosynthesis supports ecosystems and human life. Forests, like the Amazon, produce oxygen and store carbon, mitigating climate change. In agriculture, crops rely on photosynthesis for growth, impacting food production. Interdisciplinarily, engineers mimic photosynthesis in solar energy technologies, creating sustainable energy solutions inspired by nature's efficiency.",
    "image_prompt": "lush forest with sunlight filtering through trees"
  },
  {
    "slide": 7,
    "title": "Photosynthesis Byproduct",
    "type": "question",
    "content": "What is a key byproduct of photosynthesis that is essential for animal life?",
    "options": [
      "A) Carbon dioxide",
      "B) Glucose",
      "C) Oxygen",
      "D) Water"
    ],
    "answer": "C",
    "image_prompt": "bubbles of oxygen rising from underwater plants"
  },
  {
    "slide": 8,
    "title": "Conclusion: Power of Photosynthesis",
    "type": "closing",
    "content": "Photosynthesis transforms sunlight into energy, sustaining plants and producing oxygen for life on Earth. It connects biology, ecology, and technology. To deepen your understanding, observe plants in your environment and consider how they contribute to ecosystems and sustainability.",
    "image_prompt": "student studying plants in a garden with a notebook"
  }
];

export default function TestHubEduInteractivePage() {
  const [showExample, setShowExample] = useState(false);
  const [currentExampleSlide, setCurrentExampleSlide] = useState(0);

  const renderExampleSlide = (slide: any) => {
    const isQuestion = slide.type === 'question';
    const isClosing = slide.type === 'closing';

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{slide.title}</span>
            <Badge variant={isQuestion ? 'destructive' : isClosing ? 'default' : 'secondary'}>
              {slide.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">{slide.content}</p>
            
            {isQuestion && slide.options && (
              <div className="space-y-2">
                <h4 className="font-semibold">Opções:</h4>
                <ul className="space-y-1">
                  {slide.options.map((option: string, index: number) => (
                    <li key={index} className="text-sm">
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-medium text-green-600">
                  Resposta correta: {slide.answer}
                </p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-1">Image Prompt:</h5>
              <p className="text-sm text-blue-700">{slide.image_prompt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Teste do Sistema HubEdu Interativo</h1>
          <p className="text-gray-600 mb-6">
            Demonstração do sistema de aulas interativas com 8 slides e carregamento incremental
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Lesson Module */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sistema Interativo</CardTitle>
              </CardHeader>
              <CardContent>
                <HubEduLessonModule 
                  initialQuery="fotossíntese"
                  onLessonComplete={() => console.log('Aula completada!')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Example Slides */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Exemplo: Fotossíntese</span>
                  <Button
                    onClick={() => setShowExample(!showExample)}
                    variant="outline"
                    size="sm"
                  >
                    {showExample ? 'Ocultar' : 'Mostrar'} Exemplo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showExample && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Slide {currentExampleSlide + 1} de {PHOTOSYNTHESIS_EXAMPLE.length}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setCurrentExampleSlide(Math.max(0, currentExampleSlide - 1))}
                          disabled={currentExampleSlide === 0}
                          size="sm"
                          variant="outline"
                        >
                          Anterior
                        </Button>
                        <Button
                          onClick={() => setCurrentExampleSlide(Math.min(PHOTOSYNTHESIS_EXAMPLE.length - 1, currentExampleSlide + 1))}
                          disabled={currentExampleSlide === PHOTOSYNTHESIS_EXAMPLE.length - 1}
                          size="sm"
                          variant="outline"
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                    
                    {renderExampleSlide(PHOTOSYNTHESIS_EXAMPLE[currentExampleSlide])}
                  </div>
                )}
                
                {!showExample && (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Clique em &quot;Mostrar Exemplo&quot; para ver o exemplo completo de fotossíntese
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• 8 slides estruturados</p>
                      <p>• Perguntas nas posições 4 e 7</p>
                      <p>• Image prompts para cada slide</p>
                      <p>• Formato JSON padronizado</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Estrutura da Aula (8 slides)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Slide 1 → Explicação inicial (introdução ao tema)</li>
                  <li>• Slide 2 → Explicação aprofundando com exemplo prático</li>
                  <li>• Slide 3 → Explicação detalhando conceitos ou variações</li>
                  <li>• Slide 4 → Pergunta interativa (4 alternativas, só uma correta)</li>
                  <li>• Slide 5 → Explicação ampliando o conhecimento</li>
                  <li>• Slide 6 → Explicação com aplicação real ou interdisciplinar</li>
                  <li>• Slide 7 → Pergunta interativa (4 alternativas, só uma correta)</li>
                  <li>• Slide 8 → Encerramento (resumo + dica final)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Fluxo de Carregamento Incremental</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Usuário manda uma mensagem (&quot;Quero aprender frações&quot;)</li>
                  <li>• Sistema classifica o tema (matemática/frações)</li>
                  <li>• Envia requisição de imagens relacionadas ao tema</li>
                  <li>• Gera slide 1 e 2 (carregados imediatamente)</li>
                  <li>• Quando usuário avança para o slide 2, o slide 3 é requisitado</li>
                  <li>• Sempre que o usuário avança, o próximo ainda não carregado é gerado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
