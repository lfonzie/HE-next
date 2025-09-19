'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Target, 
  Zap, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';

interface WebARViewerProps {
  subject: 'anatomy' | 'chemistry' | 'physics' | 'geography' | 'history';
  topic: string;
  onComplete?: (results: ARResults) => void;
}

interface ARResults {
  timeSpent: number;
  interactions: number;
  accuracy: number;
  conceptsLearned: string[];
}

interface ARModel {
  id: string;
  name: string;
  description: string;
  type: '3d' | 'overlay' | 'interactive';
  url: string;
  markers: ARMarker[];
  interactions: ARInteraction[];
}

interface ARMarker {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  content: string;
  isDetected: boolean;
}

interface ARInteraction {
  id: string;
  type: 'tap' | 'drag' | 'rotate' | 'scale';
  target: string;
  action: string;
  feedback: string;
}

const AR_MODELS: Record<string, ARModel[]> = {
  anatomy: [
    {
      id: 'human-heart',
      name: 'Coração Humano',
      description: 'Explore a anatomia do coração humano em 3D',
      type: '3d',
      url: '/models/heart.glb',
      markers: [
        {
          id: 'atrium',
          name: 'Átrio',
          position: { x: 0, y: 0.5, z: 0 },
          content: 'Átrio: Recebe sangue das veias',
          isDetected: false
        },
        {
          id: 'ventricle',
          name: 'Ventrículo',
          position: { x: 0, y: -0.5, z: 0 },
          content: 'Ventrículo: Bombeia sangue para o corpo',
          isDetected: false
        }
      ],
      interactions: [
        {
          id: 'explode',
          type: 'tap',
          target: 'heart',
          action: 'Explodir modelo',
          feedback: 'Modelo explodido para visualização interna'
        }
      ]
    }
  ],
  chemistry: [
    {
      id: 'molecule-h2o',
      name: 'Molécula de Água',
      description: 'Visualize a estrutura molecular da água',
      type: '3d',
      url: '/models/h2o.glb',
      markers: [
        {
          id: 'oxygen',
          name: 'Oxigênio',
          position: { x: 0, y: 0, z: 0 },
          content: 'Átomo de Oxigênio (O)',
          isDetected: false
        },
        {
          id: 'hydrogen1',
          name: 'Hidrogênio 1',
          position: { x: 0.5, y: 0, z: 0 },
          content: 'Átomo de Hidrogênio (H)',
          isDetected: false
        }
      ],
      interactions: [
        {
          id: 'rotate',
          type: 'drag',
          target: 'molecule',
          action: 'Rotacionar molécula',
          feedback: 'Molécula rotacionada'
        }
      ]
    }
  ],
  physics: [
    {
      id: 'solar-system',
      name: 'Sistema Solar',
      description: 'Explore os planetas do sistema solar',
      type: '3d',
      url: '/models/solar-system.glb',
      markers: [
        {
          id: 'sun',
          name: 'Sol',
          position: { x: 0, y: 0, z: 0 },
          content: 'Estrela central do sistema solar',
          isDetected: false
        },
        {
          id: 'earth',
          name: 'Terra',
          position: { x: 2, y: 0, z: 0 },
          content: 'Nosso planeta',
          isDetected: false
        }
      ],
      interactions: [
        {
          id: 'orbit',
          type: 'tap',
          target: 'planet',
          action: 'Mostrar órbita',
          feedback: 'Órbita planetária visualizada'
        }
      ]
    }
  ],
  geography: [
    {
      id: 'world-map',
      name: 'Mapa Mundial',
      description: 'Explore países e continentes',
      type: 'overlay',
      url: '/models/world-map.glb',
      markers: [
        {
          id: 'brazil',
          name: 'Brasil',
          position: { x: -0.3, y: 0.1, z: 0 },
          content: 'República Federativa do Brasil',
          isDetected: false
        }
      ],
      interactions: [
        {
          id: 'country-info',
          type: 'tap',
          target: 'country',
          action: 'Mostrar informações',
          feedback: 'Informações do país exibidas'
        }
      ]
    }
  ],
  history: [
    {
      id: 'pyramid',
      name: 'Pirâmide de Gizé',
      description: 'Explore a Grande Pirâmide do Egito',
      type: '3d',
      url: '/models/pyramid.glb',
      markers: [
        {
          id: 'entrance',
          name: 'Entrada',
          position: { x: 0, y: 0, z: 0.5 },
          content: 'Entrada da pirâmide',
          isDetected: false
        }
      ],
      interactions: [
        {
          id: 'explore',
          type: 'tap',
          target: 'chamber',
          action: 'Explorar câmara',
          feedback: 'Câmara interna explorada'
        }
      ]
    }
  ]
};

export default function WebARViewer({ subject, topic, onComplete }: WebARViewerProps) {
  const [currentModel, setCurrentModel] = useState<ARModel | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [detectedMarkers, setDetectedMarkers] = useState<Set<string>>(new Set());
  const [interactions, setInteractions] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [arError, setArError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeARModel();
    checkCameraPermission();
  }, [subject, topic]);

  const initializeARModel = () => {
    const availableModels = AR_MODELS[subject] || [];
    const model = availableModels[0]; // Por simplicidade, pega o primeiro
    
    if (model) {
      setCurrentModel(model);
      setDetectedMarkers(new Set());
      setInteractions(0);
      setShowInstructions(true);
      setArError(null);
    }
  };

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setCameraPermission(false);
      setArError('Permissão de câmera necessária para usar AR');
    }
  };

  const startAR = async () => {
    if (!currentModel || cameraPermission === false) return;

    try {
      setIsARActive(true);
      setStartTime(new Date());
      setShowInstructions(false);

      // Inicializa a câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simula detecção de marcadores (em produção usaria bibliotecas como AR.js)
      simulateMarkerDetection();

    } catch (error) {
      console.error('Erro ao iniciar AR:', error);
      setArError('Erro ao acessar a câmera');
      setIsARActive(false);
    }
  };

  const simulateMarkerDetection = () => {
    if (!currentModel) return;

    // Simula detecção gradual de marcadores
    currentModel.markers.forEach((marker, index) => {
      setTimeout(() => {
        setDetectedMarkers(prev => new Set([...prev, marker.id]));
      }, (index + 1) * 2000);
    });
  };

  const stopAR = () => {
    setIsARActive(false);
    setStartTime(null);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleMarkerInteraction = (markerId: string) => {
    setInteractions(prev => prev + 1);
    
    // Simula feedback da interação
    const marker = currentModel?.markers.find(m => m.id === markerId);
    if (marker) {
      console.log(`Interação com ${marker.name}: ${marker.content}`);
    }
  };

  const completeARExperience = () => {
    if (!startTime) return;

    const timeSpent = Date.now() - startTime.getTime();
    const accuracy = (detectedMarkers.size / (currentModel?.markers.length || 1)) * 100;

    const results: ARResults = {
      timeSpent: Math.floor(timeSpent / 1000),
      interactions,
      accuracy,
      conceptsLearned: currentModel?.markers.map(m => m.name) || []
    };

    onComplete?.(results);
    stopAR();
  };

  const getSubjectIcon = () => {
    switch (subject) {
      case 'anatomy': return <Target className="w-8 h-8" />;
      case 'chemistry': return <Zap className="w-8 h-8" />;
      case 'physics': return <BookOpen className="w-8 h-8" />;
      case 'geography': return <Target className="w-8 h-8" />;
      case 'history': return <BookOpen className="w-8 h-8" />;
      default: return <Camera className="w-8 h-8" />;
    }
  };

  const getSubjectColor = () => {
    switch (subject) {
      case 'anatomy': return 'from-red-500 to-pink-600';
      case 'chemistry': return 'from-green-500 to-emerald-600';
      case 'physics': return 'from-blue-500 to-cyan-600';
      case 'geography': return 'from-yellow-500 to-orange-600';
      case 'history': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!currentModel) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando modelo AR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getSubjectColor()} text-white p-6 rounded-2xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getSubjectIcon()}
            <div>
              <h2 className="text-2xl font-bold">{currentModel.name}</h2>
              <p className="text-white/80">{currentModel.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{interactions}</div>
              <div className="text-sm text-white/80">Interações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0}s
              </div>
              <div className="text-sm text-white/80">Tempo</div>
            </div>
            <button
              onClick={initializeARModel}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Controles */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-6 rounded-2xl shadow-lg border"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={isARActive ? stopAR : startAR}
              disabled={cameraPermission === false}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                isARActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {isARActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isARActive ? 'Parar AR' : 'Iniciar AR'}
            </button>
            
            {cameraPermission === false && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Permissão de câmera necessária</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualização AR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Visualização AR
          </h3>
          
          <div className="relative">
            {/* Área da câmera */}
            <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
              {isARActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Overlay AR */}
                  <div className="absolute inset-0 pointer-events-none">
                    {currentModel.markers.map((marker) => (
                      <AnimatePresence key={marker.id}>
                        {detectedMarkers.has(marker.id) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
                            style={{
                              left: `${50 + marker.position.x * 20}%`,
                              top: `${50 + marker.position.y * 20}%`,
                            }}
                            onClick={() => handleMarkerInteraction(marker.id)}
                          >
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Câmera AR</p>
                    <p className="text-sm opacity-75">Clique em "Iniciar AR" para começar</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instruções */}
            {showInstructions && !isARActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <h4 className="font-bold text-blue-800 mb-2">Como usar:</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Permita acesso à câmera quando solicitado</li>
                  <li>• Aponte a câmera para uma superfície plana</li>
                  <li>• Aguarde a detecção dos marcadores AR</li>
                  <li>• Toque nos marcadores para interagir</li>
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Informações do Modelo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-500" />
            Informações
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Marcadores Detectados</label>
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(detectedMarkers.size / currentModel.markers.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {detectedMarkers.size}/{currentModel.markers.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Modelo</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">{currentModel.type}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Marcadores Disponíveis</label>
              <div className="mt-1 space-y-2">
                {currentModel.markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`p-2 rounded-lg border ${
                      detectedMarkers.has(marker.id)
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {detectedMarkers.has(marker.id) ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-400 rounded-full" />
                      )}
                      <span className="text-sm font-medium">{marker.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{marker.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Interações Disponíveis</label>
              <div className="mt-1 space-y-1">
                {currentModel.interactions.map((interaction) => (
                  <div key={interaction.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{interaction.type}:</span> {interaction.action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Erro */}
      <AnimatePresence>
        {arError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erro AR</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{arError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de Conclusão */}
      {isARActive && detectedMarkers.size === currentModel.markers.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={completeARExperience}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
          >
            Concluir Experiência AR
          </button>
        </motion.div>
      )}
    </div>
  );
}
