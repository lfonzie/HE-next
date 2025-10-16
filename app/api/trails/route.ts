import { NextRequest, NextResponse } from 'next/server';
import { Trail } from '@/types/trails';

// Mock data for development - replace with actual database queries
const mockTrails: Trail[] = [
  {
    id: 'javascript-fundamentals',
    title: 'Fundamentos do JavaScript',
    description: 'Aprenda os conceitos básicos de JavaScript de forma interativa',
    category: 'programming',
    difficulty: 'beginner',
    estimatedDuration: 120,
    prerequisites: [],
    learningObjectives: [
      'Entender variáveis e tipos de dados',
      'Dominar estruturas de controle',
      'Trabalhar com funções e objetos',
    ],
    modules: [
      {
        id: 'js-variables',
        title: 'Variáveis e Tipos',
        description: 'Aprenda sobre variáveis e tipos de dados em JavaScript',
        type: 'lesson',
        duration: 30,
        content: {
          slides: [
            {
              id: 'slide-1',
              title: 'Introdução às Variáveis',
              content: 'As variáveis são containers para armazenar dados...',
              type: 'text',
              order: 1,
              duration: 5,
              metadata: {},
            },
          ],
        },
        prerequisites: [],
        learningOutcomes: ['Entender o conceito de variáveis'],
        order: 1,
        isOptional: false,
        metadata: {},
      },
    ],
    metadata: {
      author: 'HubEdu.ia',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      tags: ['javascript', 'programming', 'beginner'],
      language: 'pt-BR',
      targetAudience: ['students', 'beginners'],
    },
  },
  {
    id: 'react-basics',
    title: 'React para Iniciantes',
    description: 'Domine os conceitos fundamentais do React',
    category: 'programming',
    difficulty: 'intermediate',
    estimatedDuration: 180,
    prerequisites: ['javascript-fundamentals'],
    learningObjectives: [
      'Entender componentes React',
      'Gerenciar estado com hooks',
      'Criar aplicações interativas',
    ],
    modules: [
      {
        id: 'react-components',
        title: 'Componentes React',
        description: 'Aprenda a criar e usar componentes React',
        type: 'lesson',
        duration: 45,
        content: {
          slides: [
            {
              id: 'slide-1',
              title: 'O que são Componentes?',
              content: 'Componentes são blocos reutilizáveis de código...',
              type: 'text',
              order: 1,
              duration: 10,
              metadata: {},
            },
          ],
        },
        prerequisites: [],
        learningOutcomes: ['Criar componentes React básicos'],
        order: 1,
        isOptional: false,
        metadata: {},
      },
    ],
    metadata: {
      author: 'HubEdu.ia',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      tags: ['react', 'javascript', 'frontend'],
      language: 'pt-BR',
      targetAudience: ['students', 'developers'],
    },
  },
  {
    id: 'mathematics-algebra',
    title: 'Álgebra Linear',
    description: 'Conceitos fundamentais de álgebra linear para estudantes',
    category: 'mathematics',
    difficulty: 'advanced',
    estimatedDuration: 240,
    prerequisites: ['mathematics-basics'],
    learningObjectives: [
      'Resolver sistemas de equações lineares',
      'Trabalhar com matrizes e vetores',
      'Aplicar conceitos em problemas práticos',
    ],
    modules: [
      {
        id: 'linear-systems',
        title: 'Sistemas Lineares',
        description: 'Métodos para resolver sistemas de equações lineares',
        type: 'lesson',
        duration: 60,
        content: {
          slides: [
            {
              id: 'slide-1',
              title: 'Introdução aos Sistemas Lineares',
              content: 'Um sistema linear é um conjunto de equações...',
              type: 'text',
              order: 1,
              duration: 15,
              metadata: {},
            },
          ],
        },
        prerequisites: [],
        learningOutcomes: ['Resolver sistemas lineares simples'],
        order: 1,
        isOptional: false,
        metadata: {},
      },
    ],
    metadata: {
      author: 'HubEdu.ia',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      tags: ['mathematics', 'algebra', 'linear'],
      language: 'pt-BR',
      targetAudience: ['students', 'university'],
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const duration = searchParams.get('duration');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    let filteredTrails = mockTrails;

    // Apply filters
    if (category) {
      filteredTrails = filteredTrails.filter(trail => trail.category === category);
    }

    if (difficulty) {
      filteredTrails = filteredTrails.filter(trail => trail.difficulty === difficulty);
    }

    if (duration) {
      const maxDuration = parseInt(duration);
      filteredTrails = filteredTrails.filter(trail => trail.estimatedDuration <= maxDuration);
    }

    if (tags) {
      const tagList = tags.split(',');
      filteredTrails = filteredTrails.filter(trail =>
        tagList.some(tag => trail.metadata.tags.includes(tag))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTrails = filteredTrails.filter(trail =>
        trail.title.toLowerCase().includes(searchLower) ||
        trail.description.toLowerCase().includes(searchLower) ||
        trail.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // TODO: Replace with actual database query
    // const trails = await db.trail.findMany({
    //   where: {
    //     ...(category && { category }),
    //     ...(difficulty && { difficulty }),
    //     ...(duration && { estimatedDuration: { lte: parseInt(duration) } }),
    //     ...(tags && { metadata: { tags: { hasSome: tags.split(',') } } }),
    //     ...(search && {
    //       OR: [
    //         { title: { contains: search, mode: 'insensitive' } },
    //         { description: { contains: search, mode: 'insensitive' } },
    //       ],
    //     }),
    //   },
    // });

    return NextResponse.json({
      trails: filteredTrails,
      total: filteredTrails.length,
      filters: {
        category,
        difficulty,
        duration,
        tags,
        search,
      },
    });

  } catch (error) {
    console.error('Error fetching trails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, difficulty, modules, metadata } = body;

    if (!title || !description || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database creation
    // const trail = await db.trail.create({
    //   data: {
    //     title,
    //     description,
    //     category,
    //     difficulty,
    //     modules,
    //     metadata,
    //     author: 'current-user-id',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // });

    const newTrail: Trail = {
      id: `trail-${Date.now()}`,
      title,
      description,
      category,
      difficulty,
      estimatedDuration: modules?.reduce((total: number, module: any) => total + (module.duration || 0), 0) || 0,
      prerequisites: [],
      learningObjectives: [],
      modules: modules || [],
      metadata: {
        author: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: [],
        language: 'pt-BR',
        targetAudience: [],
        ...metadata,
      },
    };

    return NextResponse.json({
      trail: newTrail,
      message: 'Trail created successfully',
    });

  } catch (error) {
    console.error('Error creating trail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
