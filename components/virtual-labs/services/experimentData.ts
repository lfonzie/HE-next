import { Experiment, ExperimentID } from '../types/experiment';
import { EnhancedChemicalReactionLab } from '../experiments/EnhancedChemicalReactionLab';
import { PendulumLab } from '../experiments/PendulumLab';
import { BouncingBallLab } from '../experiments/BouncingBallLab';
import { ColorMixingLab } from '../experiments/ColorMixingLab';
import { CellMicroscopyLab } from '../CellMicroscopyLab';
import { FunctionGraphingLab } from '../FunctionGraphingLab';
import { ElectromagnetismLab } from '../ElectromagnetismLab';
import { ThermodynamicsLab } from '../ThermodynamicsLab';
import { OpticsLab } from '../OpticsLab';
import { OrganicChemistryLab } from '../OrganicChemistryLab';
import { FlaskIcon } from '../icons/FlaskIcon';
import { PendulumIcon } from '../icons/PendulumIcon';
import { BallIcon } from '../icons/BallIcon';
import { ColorIcon } from '../icons/ColorIcon';

export const experiments: Experiment[] = [
  {
    id: ExperimentID.CHEMICAL_REACTION,
    name: 'Reação Química',
    description: 'Misture compostos químicos e veja a IA prever o resultado, com explicações científicas e efeitos visuais.',
    icon: FlaskIcon,
    component: EnhancedChemicalReactionLab,
    category: 'chemistry',
    difficulty: 'intermediate',
    duration: 15,
    tags: ['química', 'reações', 'compostos', 'laboratório']
  },
  {
    id: ExperimentID.PENDULUM,
    name: 'Movimento Pendular',
    description: 'Observe o movimento harmônico simples. Ajuste o comprimento e o ângulo para ver como isso afeta o período.',
    icon: PendulumIcon,
    component: PendulumLab,
    category: 'physics',
    difficulty: 'beginner',
    duration: 10,
    tags: ['física', 'movimento', 'pêndulo', 'harmônico']
  },
  {
    id: ExperimentID.BOUNCING_BALL,
    name: 'Bola Saltitante',
    description: 'Explore gravidade e elasticidade. Ajuste o coeficiente de restituição e observe o comportamento da bola.',
    icon: BallIcon,
    component: BouncingBallLab,
    category: 'physics',
    difficulty: 'beginner',
    duration: 8,
    tags: ['física', 'gravidade', 'elasticidade', 'movimento']
  },
  {
    id: ExperimentID.COLOR_MIXING,
    name: 'Mistura de Cores',
    description: 'Explore a teoria das cores e como diferentes combinações criam novas cores. Experimente com RGB e CMYK.',
    icon: ColorIcon,
    component: ColorMixingLab,
    category: 'optics',
    difficulty: 'beginner',
    duration: 12,
    tags: ['óptica', 'cores', 'RGB', 'CMYK', 'teoria']
  },
  {
    id: 'cell-microscopy' as ExperimentID,
    name: 'Microscopia Celular',
    description: 'Explore diferentes tipos de células e suas estruturas usando microscópio virtual.',
    icon: FlaskIcon,
    component: CellMicroscopyLab,
    category: 'biology',
    difficulty: 'intermediate',
    duration: 20,
    tags: ['biologia', 'células', 'microscopia', 'estrutura']
  },
  {
    id: 'function-graphing' as ExperimentID,
    name: 'Gráficos de Funções',
    description: 'Visualize e analise diferentes tipos de funções matemáticas com gráficos interativos.',
    icon: ColorIcon,
    component: FunctionGraphingLab,
    category: 'mathematics',
    difficulty: 'beginner',
    duration: 15,
    tags: ['matemática', 'funções', 'gráficos', 'análise']
  },
  {
    id: 'electromagnetism' as ExperimentID,
    name: 'Eletromagnetismo',
    description: 'Explore circuitos elétricos, campos magnéticos e fenômenos eletromagnéticos.',
    icon: FlaskIcon,
    component: ElectromagnetismLab,
    category: 'physics',
    difficulty: 'intermediate',
    duration: 25,
    tags: ['física', 'eletromagnetismo', 'circuitos', 'campos']
  },
  {
    id: 'thermodynamics' as ExperimentID,
    name: 'Termodinâmica',
    description: 'Estude transferência de calor, mudanças de fase e leis da termodinâmica.',
    icon: FlaskIcon,
    component: ThermodynamicsLab,
    category: 'physics',
    difficulty: 'advanced',
    duration: 30,
    tags: ['física', 'termodinâmica', 'calor', 'fases']
  },
  {
    id: 'optics' as ExperimentID,
    name: 'Ótica',
    description: 'Explore refração, reflexão, interferência e outros fenômenos ópticos.',
    icon: ColorIcon,
    component: OpticsLab,
    category: 'physics',
    difficulty: 'intermediate',
    duration: 20,
    tags: ['física', 'óptica', 'refração', 'interferência']
  },
  {
    id: 'organic-chemistry' as ExperimentID,
    name: 'Química Orgânica',
    description: 'Explore síntese de moléculas, mecanismos de reação e design de fármacos.',
    icon: FlaskIcon,
    component: OrganicChemistryLab,
    category: 'chemistry',
    difficulty: 'advanced',
    duration: 35,
    tags: ['química', 'orgânica', 'síntese', 'fármacos']
  }
];

export const getExperimentById = (id: ExperimentID): Experiment | undefined => {
  return experiments.find(exp => exp.id === id);
};

export const getExperimentsByCategory = (category: string): Experiment[] => {
  return experiments.filter(exp => exp.category === category);
};

export const getExperimentsByDifficulty = (difficulty: string): Experiment[] => {
  return experiments.filter(exp => exp.difficulty === difficulty);
};

export const getExperimentsByTag = (tag: string): Experiment[] => {
  return experiments.filter(exp => exp.tags.includes(tag));
};

export const getAllCategories = (): string[] => {
  return [...new Set(experiments.map(exp => exp.category))];
};

export const getAllTags = (): string[] => {
  return [...new Set(experiments.flatMap(exp => exp.tags))];
};

export const getRecommendedExperiments = (): Experiment[] => {
  return experiments
    .sort((a, b) => {
      // Priorizar experimentos mais fáceis e de menor duração
      const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      const difficultyDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      if (difficultyDiff !== 0) return difficultyDiff;
      return a.duration - b.duration;
    })
    .slice(0, 3);
};
