// assets/sprites.ts - Sistema de sprites realistas
export interface SpriteConfig {
  id: string;
  name: string;
  category: 'glassware' | 'instruments' | 'reagents' | 'equipment';
  imageUrl: string;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  scale?: number;
  shadow?: boolean;
  glow?: boolean;
  animation?: {
    type: 'rotate' | 'pulse' | 'float' | 'pour' | 'mix';
    duration: number;
    loop: boolean;
  };
}

// Biblioteca de sprites realistas usando imagens da internet
export const REALISTIC_SPRITES: SpriteConfig[] = [
  // Vidrarias
  {
    id: 'beaker-100ml',
    name: 'Béquer 100 mL',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 80,
    height: 100,
    shadow: true,
    glow: false
  },
  {
    id: 'beaker-250ml',
    name: 'Béquer 250 mL',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 90,
    height: 120,
    shadow: true,
    glow: false
  },
  {
    id: 'erlenmeyer-250ml',
    name: 'Erlenmeyer 250 mL',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 85,
    height: 110,
    shadow: true,
    glow: false
  },
  {
    id: 'burette-50ml',
    name: 'Bureta 50 mL',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 60,
    height: 200,
    shadow: true,
    glow: false,
    animation: {
      type: 'pour',
      duration: 2000,
      loop: false
    }
  },
  {
    id: 'pipette-10ml',
    name: 'Pipeta 10 mL',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 40,
    height: 150,
    shadow: true,
    glow: false
  },
  {
    id: 'flask-volumetric',
    name: 'Balão Volumétrico',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 80,
    height: 120,
    shadow: true,
    glow: false
  },
  {
    id: 'test-tube',
    name: 'Tubo de Ensaio',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 30,
    height: 80,
    shadow: true,
    glow: false
  },
  {
    id: 'graduated-cylinder',
    name: 'Proveta',
    category: 'glassware',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 50,
    height: 150,
    shadow: true,
    glow: false
  },

  // Instrumentos
  {
    id: 'ph-meter',
    name: 'pHmetro',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 120,
    height: 80,
    shadow: true,
    glow: true,
    animation: {
      type: 'pulse',
      duration: 3000,
      loop: true
    }
  },
  {
    id: 'thermometer',
    name: 'Termômetro',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 40,
    height: 120,
    shadow: true,
    glow: false
  },
  {
    id: 'balance',
    name: 'Balança',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 150,
    height: 100,
    shadow: true,
    glow: false
  },
  {
    id: 'voltmeter',
    name: 'Voltímetro',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 100,
    height: 80,
    shadow: true,
    glow: true
  },
  {
    id: 'ammeter',
    name: 'Amperímetro',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 100,
    height: 80,
    shadow: true,
    glow: true
  },
  {
    id: 'stopwatch',
    name: 'Cronômetro',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 80,
    height: 80,
    shadow: true,
    glow: false
  },
  {
    id: 'ruler',
    name: 'Régua',
    category: 'instruments',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 200,
    height: 30,
    shadow: true,
    glow: false
  },

  // Reagentes
  {
    id: 'hcl-solution',
    name: 'HCl 0,1 M',
    category: 'reagents',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 60,
    height: 80,
    shadow: true,
    glow: false
  },
  {
    id: 'naoh-solution',
    name: 'NaOH 0,1 M',
    category: 'reagents',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 60,
    height: 80,
    shadow: true,
    glow: false
  },
  {
    id: 'phenolphthalein',
    name: 'Fenolftaleína',
    category: 'reagents',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 50,
    height: 70,
    shadow: true,
    glow: false
  },
  {
    id: 'bromothymol-blue',
    name: 'Azul de Bromotimol',
    category: 'reagents',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 50,
    height: 70,
    shadow: true,
    glow: false
  },
  {
    id: 'distilled-water',
    name: 'Água Destilada',
    category: 'reagents',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 60,
    height: 80,
    shadow: true,
    glow: false
  },

  // Equipamentos
  {
    id: 'hot-plate',
    name: 'Placa de Aquecimento',
    category: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 120,
    height: 80,
    shadow: true,
    glow: false,
    animation: {
      type: 'pulse',
      duration: 2000,
      loop: true
    }
  },
  {
    id: 'magnetic-stirrer',
    name: 'Agitador Magnético',
    category: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 100,
    height: 80,
    shadow: true,
    glow: false,
    animation: {
      type: 'rotate',
      duration: 1000,
      loop: true
    }
  },
  {
    id: 'bunsen-burner',
    name: 'Bico de Bunsen',
    category: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 60,
    height: 100,
    shadow: true,
    glow: true,
    animation: {
      type: 'pulse',
      duration: 1500,
      loop: true
    }
  },
  {
    id: 'tripod',
    name: 'Tripé',
    category: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 80,
    height: 60,
    shadow: true,
    glow: false
  },
  {
    id: 'wire-gauze',
    name: 'Tela de Amianto',
    category: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop&crop=center',
    width: 70,
    height: 70,
    shadow: true,
    glow: false
  }
];

// Função para obter sprite por ID
export const getSpriteById = (id: string): SpriteConfig | undefined => {
  return REALISTIC_SPRITES.find(sprite => sprite.id === id);
};

// Função para obter sprites por categoria
export const getSpritesByCategory = (category: string): SpriteConfig[] => {
  return REALISTIC_SPRITES.filter(sprite => sprite.category === category);
};

// Função para obter sprite com fallback
export const getSpriteWithFallback = (id: string, fallbackId: string = 'beaker-100ml'): SpriteConfig => {
  return getSpriteById(id) || getSpriteById(fallbackId) || REALISTIC_SPRITES[0];
};

// Configurações de efeitos visuais
export const VISUAL_EFFECTS = {
  shadow: {
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: 'rgba(0, 0, 0, 0.3)'
  },
  glow: {
    color: '#00ff00',
    intensity: 0.5,
    radius: 10
  },
  liquid: {
    opacity: 0.8,
    reflection: true,
    waves: true
  },
  reaction: {
    particles: true,
    colorChange: true,
    bubbles: true
  }
};

// Animações predefinidas
export const ANIMATIONS = {
  pour: {
    keyframes: [
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: 'rotate(45deg)', offset: 0.5 },
      { transform: 'rotate(0deg)', offset: 1 }
    ],
    easing: 'ease-in-out'
  },
  mix: {
    keyframes: [
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: 'rotate(10deg)', offset: 0.25 },
      { transform: 'rotate(-10deg)', offset: 0.5 },
      { transform: 'rotate(10deg)', offset: 0.75 },
      { transform: 'rotate(0deg)', offset: 1 }
    ],
    easing: 'ease-in-out'
  },
  pulse: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1, offset: 0 },
      { transform: 'scale(1.05)', opacity: 0.8, offset: 0.5 },
      { transform: 'scale(1)', opacity: 1, offset: 1 }
    ],
    easing: 'ease-in-out'
  },
  float: {
    keyframes: [
      { transform: 'translateY(0px)', offset: 0 },
      { transform: 'translateY(-5px)', offset: 0.5 },
      { transform: 'translateY(0px)', offset: 1 }
    ],
    easing: 'ease-in-out'
  }
};
