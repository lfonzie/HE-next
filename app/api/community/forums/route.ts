import { NextRequest, NextResponse } from 'next/server';
import { Forum, Post, StudyGroup } from '@/hooks/useCommunityForums';

// Mock database for forums
const mockForums: Forum[] = [
  {
    id: 'forum_001',
    name: 'Matemática ENEM',
    description: 'Discussões sobre matemática para o ENEM',
    category: 'academic',
    icon: '📊',
    color: 'bg-blue-500',
    memberCount: 1250,
    postCount: 3420,
    lastActivity: '2023-12-15T14:30:00Z',
    rules: [
      {
        id: 'rule_001',
        title: 'Seja respeitoso',
        description: 'Mantenha um ambiente respeitoso e construtivo',
        severity: 'warning',
      },
      {
        id: 'rule_002',
        title: 'Posts relevantes',
        description: 'Mantenha os posts relacionados à matemática',
        severity: 'info',
      },
    ],
    moderators: ['mod_001', 'mod_002'],
    isPrivate: false,
    tags: ['matemática', 'enem', 'vestibular', 'álgebra', 'geometria'],
  },
  {
    id: 'forum_002',
    name: 'Física Fundamental',
    description: 'Discussões sobre conceitos fundamentais de física',
    category: 'academic',
    icon: '⚛️',
    color: 'bg-green-500',
    memberCount: 890,
    postCount: 2150,
    lastActivity: '2023-12-14T16:45:00Z',
    rules: [
      {
        id: 'rule_003',
        title: 'Seja respeitoso',
        description: 'Mantenha um ambiente respeitoso e construtivo',
        severity: 'warning',
      },
    ],
    moderators: ['mod_003'],
    isPrivate: false,
    tags: ['física', 'mecânica', 'termodinâmica', 'eletromagnetismo'],
  },
  {
    id: 'forum_003',
    name: 'Grupos de Estudo',
    description: 'Organize e participe de grupos de estudo',
    category: 'study_groups',
    icon: '👥',
    color: 'bg-purple-500',
    memberCount: 2100,
    postCount: 1800,
    lastActivity: '2023-12-15T10:20:00Z',
    rules: [
      {
        id: 'rule_004',
        title: 'Seja respeitoso',
        description: 'Mantenha um ambiente respeitoso e construtivo',
        severity: 'warning',
      },
    ],
    moderators: ['mod_004', 'mod_005'],
    isPrivate: false,
    tags: ['grupos', 'estudo', 'colaboração', 'aprendizado'],
  },
  {
    id: 'forum_004',
    name: 'Projetos e Trabalhos',
    description: 'Compartilhe projetos e trabalhos acadêmicos',
    category: 'projects',
    icon: '📋',
    color: 'bg-orange-500',
    memberCount: 650,
    postCount: 1200,
    lastActivity: '2023-12-13T09:15:00Z',
    rules: [
      {
        id: 'rule_005',
        title: 'Seja respeitoso',
        description: 'Mantenha um ambiente respeitoso e construtivo',
        severity: 'warning',
      },
    ],
    moderators: ['mod_006'],
    isPrivate: false,
    tags: ['projetos', 'trabalhos', 'pesquisa', 'apresentações'],
  },
  {
    id: 'forum_005',
    name: 'Anúncios Oficiais',
    description: 'Anúncios e comunicados oficiais da plataforma',
    category: 'announcements',
    icon: '📢',
    color: 'bg-red-500',
    memberCount: 5000,
    postCount: 150,
    lastActivity: '2023-12-15T08:00:00Z',
    rules: [
      {
        id: 'rule_006',
        title: 'Apenas administradores',
        description: 'Apenas administradores podem postar aqui',
        severity: 'critical',
      },
    ],
    moderators: ['admin_001', 'admin_002'],
    isPrivate: false,
    tags: ['anúncios', 'oficial', 'comunicados'],
  },
];

// Mock database for posts
const mockPosts: Post[] = [
  {
    id: 'post_001',
    title: 'Como resolver equações de segundo grau?',
    content: 'Estou com dificuldade para resolver equações de segundo grau. Alguém pode me ajudar com exemplos práticos?',
    author: {
      id: 'user_001',
      name: 'João Silva',
      avatar: '/avatars/joao.jpg',
      role: 'student',
      badges: [
        {
          id: 'badge_001',
          name: 'Novato',
          icon: '🌟',
          color: 'text-yellow-600',
          description: 'Primeiro post no fórum',
        },
      ],
      reputation: 150,
      joinDate: '2023-10-01T00:00:00Z',
    },
    forumId: 'forum_001',
    createdAt: '2023-12-15T14:30:00Z',
    updatedAt: '2023-12-15T14:30:00Z',
    tags: ['equações', 'segundo grau', 'álgebra'],
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    views: 45,
    likes: 8,
    dislikes: 0,
    replies: [
      {
        id: 'reply_001',
        content: 'Para resolver equações de segundo grau, você pode usar a fórmula de Bhaskara: x = (-b ± √(b² - 4ac)) / 2a',
        author: {
          id: 'user_002',
          name: 'Maria Santos',
          avatar: '/avatars/maria.jpg',
          role: 'teacher',
          badges: [
            {
              id: 'badge_002',
              name: 'Professor',
              icon: '👨‍🏫',
              color: 'text-blue-600',
              description: 'Professor certificado',
            },
          ],
          reputation: 2500,
          joinDate: '2023-08-15T00:00:00Z',
        },
        createdAt: '2023-12-15T15:00:00Z',
        updatedAt: '2023-12-15T15:00:00Z',
        likes: 12,
        dislikes: 0,
        isSolution: true,
        attachments: [],
      },
    ],
    attachments: [],
    status: 'published',
  },
  {
    id: 'post_002',
    title: 'Grupo de Estudo - Física ENEM',
    content: 'Estou organizando um grupo de estudo para física do ENEM. Interessados em participar?',
    author: {
      id: 'user_003',
      name: 'Pedro Costa',
      avatar: '/avatars/pedro.jpg',
      role: 'student',
      badges: [
        {
          id: 'badge_003',
          name: 'Organizador',
          icon: '📋',
          color: 'text-green-600',
          description: 'Organiza grupos de estudo',
        },
      ],
      reputation: 800,
      joinDate: '2023-09-20T00:00:00Z',
    },
    forumId: 'forum_003',
    createdAt: '2023-12-14T16:45:00Z',
    updatedAt: '2023-12-14T16:45:00Z',
    tags: ['grupo', 'estudo', 'física', 'enem'],
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    views: 120,
    likes: 15,
    dislikes: 1,
    replies: [
      {
        id: 'reply_002',
        content: 'Tenho interesse! Quando seria o primeiro encontro?',
        author: {
          id: 'user_004',
          name: 'Ana Lima',
          avatar: '/avatars/ana.jpg',
          role: 'student',
          badges: [],
          reputation: 300,
          joinDate: '2023-11-01T00:00:00Z',
        },
        createdAt: '2023-12-14T17:00:00Z',
        updatedAt: '2023-12-14T17:00:00Z',
        likes: 3,
        dislikes: 0,
        isSolution: false,
        attachments: [],
      },
    ],
    attachments: [],
    status: 'published',
  },
];

// Mock database for study groups
const mockStudyGroups: StudyGroup[] = [
  {
    id: 'group_001',
    name: 'Matemática ENEM - Grupo A',
    description: 'Grupo de estudo focado em matemática para o ENEM',
    subject: 'Matemática',
    level: 'intermediate',
    maxMembers: 10,
    currentMembers: 7,
    members: [
      {
        id: 'user_001',
        name: 'João Silva',
        avatar: '/avatars/joao.jpg',
        role: 'leader',
        joinDate: '2023-12-01T00:00:00Z',
        contribution: 95,
      },
      {
        id: 'user_002',
        name: 'Maria Santos',
        avatar: '/avatars/maria.jpg',
        role: 'member',
        joinDate: '2023-12-02T00:00:00Z',
        contribution: 88,
      },
    ],
    schedule: [
      {
        id: 'schedule_001',
        day: 'Segunda',
        time: '19:00',
        duration: 120,
        type: 'study_session',
        description: 'Revisão de álgebra',
      },
      {
        id: 'schedule_002',
        day: 'Quarta',
        time: '19:00',
        duration: 120,
        type: 'discussion',
        description: 'Discussão de exercícios',
      },
    ],
    goals: [
      'Dominar conceitos de álgebra',
      'Resolver problemas de geometria',
      'Preparar para o ENEM',
    ],
    resources: [
      {
        id: 'resource_001',
        name: 'Lista de Exercícios - Álgebra',
        type: 'document',
        url: '/resources/algebra_exercises.pdf',
        description: 'Lista de exercícios de álgebra para prática',
        uploadedBy: 'user_001',
        uploadedAt: '2023-12-01T10:00:00Z',
      },
    ],
    isPrivate: false,
    createdBy: 'user_001',
    createdAt: '2023-12-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'group_002',
    name: 'Física Fundamental - Grupo B',
    description: 'Grupo de estudo para física fundamental',
    subject: 'Física',
    level: 'beginner',
    maxMembers: 8,
    currentMembers: 5,
    members: [
      {
        id: 'user_003',
        name: 'Pedro Costa',
        avatar: '/avatars/pedro.jpg',
        role: 'leader',
        joinDate: '2023-12-05T00:00:00Z',
        contribution: 92,
      },
    ],
    schedule: [
      {
        id: 'schedule_003',
        day: 'Terça',
        time: '18:00',
        duration: 90,
        type: 'study_session',
        description: 'Conceitos básicos de mecânica',
      },
    ],
    goals: [
      'Entender conceitos básicos de física',
      'Resolver problemas práticos',
      'Preparar para avaliações',
    ],
    resources: [],
    isPrivate: false,
    createdBy: 'user_003',
    createdAt: '2023-12-05T00:00:00Z',
    status: 'active',
  },
];

// Get all forums
export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const search = req.nextUrl.searchParams.get('search');

    let filteredForums = mockForums;

    if (category && category !== 'all') {
      filteredForums = filteredForums.filter(forum => forum.category === category);
    }

    if (search) {
      filteredForums = filteredForums.filter(forum =>
        forum.name.toLowerCase().includes(search.toLowerCase()) ||
        forum.description.toLowerCase().includes(search.toLowerCase()) ||
        forum.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return NextResponse.json({ forums: filteredForums }, { status: 200 });
  } catch (error) {
    console.error('Error fetching forums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forums' },
      { status: 500 }
    );
  }
}

// Create a new forum
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      category,
      icon,
      color,
      rules,
      moderators,
      isPrivate,
      tags,
    } = await req.json();

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Generate forum ID
    const forumId = `forum_${Date.now()}`;

    // Create new forum
    const newForum: Forum = {
      id: forumId,
      name,
      description,
      category,
      icon: icon || '💬',
      color: color || 'bg-gray-500',
      memberCount: 0,
      postCount: 0,
      lastActivity: new Date().toISOString(),
      rules: rules || [],
      moderators: moderators || [],
      isPrivate: isPrivate || false,
      tags: tags || [],
    };

    // Add to mock database
    mockForums.push(newForum);

    return NextResponse.json({ forum: newForum }, { status: 201 });
  } catch (error) {
    console.error('Error creating forum:', error);
    return NextResponse.json(
      { error: 'Failed to create forum' },
      { status: 500 }
    );
  }
}

// Update a forum
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Forum ID is required' },
        { status: 400 }
      );
    }

    const forumIndex = mockForums.findIndex(f => f.id === id);
    if (forumIndex === -1) {
      return NextResponse.json(
        { error: 'Forum not found' },
        { status: 404 }
      );
    }

    // Update forum
    mockForums[forumIndex] = {
      ...mockForums[forumIndex],
      ...updates,
    };

    return NextResponse.json({ forum: mockForums[forumIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating forum:', error);
    return NextResponse.json(
      { error: 'Failed to update forum' },
      { status: 500 }
    );
  }
}

// Delete a forum
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Forum ID is required' },
        { status: 400 }
      );
    }

    const forumIndex = mockForums.findIndex(f => f.id === id);
    if (forumIndex === -1) {
      return NextResponse.json(
        { error: 'Forum not found' },
        { status: 404 }
      );
    }

    // Remove forum
    mockForums.splice(forumIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting forum:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum' },
      { status: 500 }
    );
  }
}
