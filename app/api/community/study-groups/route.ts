import { NextRequest, NextResponse } from 'next/server';
import { StudyGroup } from '@/hooks/useCommunityForums';

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
      {
        id: 'user_003',
        name: 'Pedro Costa',
        avatar: '/avatars/pedro.jpg',
        role: 'member',
        joinDate: '2023-12-03T00:00:00Z',
        contribution: 75,
      },
      {
        id: 'user_004',
        name: 'Ana Lima',
        avatar: '/avatars/ana.jpg',
        role: 'member',
        joinDate: '2023-12-04T00:00:00Z',
        contribution: 82,
      },
      {
        id: 'user_005',
        name: 'Carlos Mendes',
        avatar: '/avatars/carlos.jpg',
        role: 'member',
        joinDate: '2023-12-05T00:00:00Z',
        contribution: 90,
      },
      {
        id: 'user_006',
        name: 'Fernanda Oliveira',
        avatar: '/avatars/fernanda.jpg',
        role: 'member',
        joinDate: '2023-12-06T00:00:00Z',
        contribution: 78,
      },
      {
        id: 'user_007',
        name: 'Rafael Souza',
        avatar: '/avatars/rafael.jpg',
        role: 'member',
        joinDate: '2023-12-07T00:00:00Z',
        contribution: 85,
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
      {
        id: 'schedule_003',
        day: 'Sexta',
        time: '19:00',
        duration: 90,
        type: 'quiz',
        description: 'Simulado semanal',
      },
    ],
    goals: [
      'Dominar conceitos de álgebra',
      'Resolver problemas de geometria',
      'Preparar para o ENEM',
      'Melhorar raciocínio lógico',
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
      {
        id: 'resource_002',
        name: 'Vídeo Aula - Geometria',
        type: 'video',
        url: '/resources/geometry_video.mp4',
        description: 'Vídeo aula sobre conceitos de geometria',
        uploadedBy: 'user_002',
        uploadedAt: '2023-12-02T14:30:00Z',
      },
      {
        id: 'resource_003',
        name: 'Simulado ENEM 2023',
        type: 'quiz',
        url: '/resources/enem_simulado_2023.pdf',
        description: 'Simulado do ENEM 2023 para prática',
        uploadedBy: 'user_001',
        uploadedAt: '2023-12-03T09:15:00Z',
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
        id: 'user_008',
        name: 'Lucas Ferreira',
        avatar: '/avatars/lucas.jpg',
        role: 'leader',
        joinDate: '2023-12-05T00:00:00Z',
        contribution: 92,
      },
      {
        id: 'user_009',
        name: 'Isabella Rocha',
        avatar: '/avatars/isabella.jpg',
        role: 'member',
        joinDate: '2023-12-06T00:00:00Z',
        contribution: 87,
      },
      {
        id: 'user_010',
        name: 'Gabriel Alves',
        avatar: '/avatars/gabriel.jpg',
        role: 'member',
        joinDate: '2023-12-07T00:00:00Z',
        contribution: 79,
      },
      {
        id: 'user_011',
        name: 'Mariana Dias',
        avatar: '/avatars/mariana.jpg',
        role: 'member',
        joinDate: '2023-12-08T00:00:00Z',
        contribution: 83,
      },
      {
        id: 'user_012',
        name: 'Thiago Martins',
        avatar: '/avatars/thiago.jpg',
        role: 'member',
        joinDate: '2023-12-09T00:00:00Z',
        contribution: 76,
      },
    ],
    schedule: [
      {
        id: 'schedule_004',
        day: 'Terça',
        time: '18:00',
        duration: 90,
        type: 'study_session',
        description: 'Conceitos básicos de mecânica',
      },
      {
        id: 'schedule_005',
        day: 'Quinta',
        time: '18:00',
        duration: 90,
        type: 'discussion',
        description: 'Discussão de problemas práticos',
      },
    ],
    goals: [
      'Entender conceitos básicos de física',
      'Resolver problemas práticos',
      'Preparar para avaliações',
      'Desenvolver raciocínio científico',
    ],
    resources: [
      {
        id: 'resource_004',
        name: 'Manual de Física Básica',
        type: 'document',
        url: '/resources/physics_manual.pdf',
        description: 'Manual com conceitos fundamentais de física',
        uploadedBy: 'user_008',
        uploadedAt: '2023-12-05T11:00:00Z',
      },
    ],
    isPrivate: false,
    createdBy: 'user_008',
    createdAt: '2023-12-05T00:00:00Z',
    status: 'active',
  },
  {
    id: 'group_003',
    name: 'Química Orgânica - Avançado',
    description: 'Grupo de estudo para química orgânica avançada',
    subject: 'Química',
    level: 'advanced',
    maxMembers: 6,
    currentMembers: 6,
    members: [
      {
        id: 'user_013',
        name: 'Beatriz Silva',
        avatar: '/avatars/beatriz.jpg',
        role: 'leader',
        joinDate: '2023-12-10T00:00:00Z',
        contribution: 98,
      },
      {
        id: 'user_014',
        name: 'Diego Santos',
        avatar: '/avatars/diego.jpg',
        role: 'member',
        joinDate: '2023-12-11T00:00:00Z',
        contribution: 94,
      },
      {
        id: 'user_015',
        name: 'Camila Lima',
        avatar: '/avatars/camila.jpg',
        role: 'member',
        joinDate: '2023-12-12T00:00:00Z',
        contribution: 91,
      },
      {
        id: 'user_016',
        name: 'André Costa',
        avatar: '/avatars/andre.jpg',
        role: 'member',
        joinDate: '2023-12-13T00:00:00Z',
        contribution: 89,
      },
      {
        id: 'user_017',
        name: 'Juliana Mendes',
        avatar: '/avatars/juliana.jpg',
        role: 'member',
        joinDate: '2023-12-14T00:00:00Z',
        contribution: 86,
      },
      {
        id: 'user_018',
        name: 'Rodrigo Oliveira',
        avatar: '/avatars/rodrigo.jpg',
        role: 'member',
        joinDate: '2023-12-15T00:00:00Z',
        contribution: 93,
      },
    ],
    schedule: [
      {
        id: 'schedule_006',
        day: 'Segunda',
        time: '20:00',
        duration: 150,
        type: 'study_session',
        description: 'Revisão de reações orgânicas',
      },
      {
        id: 'schedule_007',
        day: 'Quarta',
        time: '20:00',
        duration: 150,
        type: 'project',
        description: 'Projeto de síntese orgânica',
      },
    ],
    goals: [
      'Dominar reações orgânicas',
      'Entender mecanismos de reação',
      'Preparar para olimpíadas',
      'Desenvolver projetos práticos',
    ],
    resources: [
      {
        id: 'resource_005',
        name: 'Atlas de Reações Orgânicas',
        type: 'document',
        url: '/resources/organic_reactions_atlas.pdf',
        description: 'Atlas completo de reações orgânicas',
        uploadedBy: 'user_013',
        uploadedAt: '2023-12-10T13:00:00Z',
      },
      {
        id: 'resource_006',
        name: 'Simulador de Reações',
        type: 'link',
        url: 'https://chemdraw.com/simulator',
        description: 'Simulador online de reações químicas',
        uploadedBy: 'user_014',
        uploadedAt: '2023-12-11T15:30:00Z',
      },
    ],
    isPrivate: true,
    createdBy: 'user_013',
    createdAt: '2023-12-10T00:00:00Z',
    status: 'active',
  },
];

// Get all study groups
export async function GET(req: NextRequest) {
  try {
    const subject = req.nextUrl.searchParams.get('subject');
    const level = req.nextUrl.searchParams.get('level');
    const search = req.nextUrl.searchParams.get('search');
    const status = req.nextUrl.searchParams.get('status');
    const isPrivate = req.nextUrl.searchParams.get('isPrivate');

    let filteredGroups = mockStudyGroups;

    if (subject) {
      filteredGroups = filteredGroups.filter(group => 
        group.subject.toLowerCase() === subject.toLowerCase()
      );
    }

    if (level) {
      filteredGroups = filteredGroups.filter(group => group.level === level);
    }

    if (status) {
      filteredGroups = filteredGroups.filter(group => group.status === status);
    }

    if (isPrivate !== null) {
      const isPrivateBool = isPrivate === 'true';
      filteredGroups = filteredGroups.filter(group => group.isPrivate === isPrivateBool);
    }

    if (search) {
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.description.toLowerCase().includes(search.toLowerCase()) ||
        group.goals.some(goal => goal.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort by creation date (newest first)
    filteredGroups.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ studyGroups: filteredGroups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching study groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
      { status: 500 }
    );
  }
}

// Create a new study group
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      subject,
      level,
      maxMembers,
      schedule,
      goals,
      isPrivate,
      createdBy,
    } = await req.json();

    if (!name || !description || !subject || !level || !createdBy) {
      return NextResponse.json(
        { error: 'Name, description, subject, level, and createdBy are required' },
        { status: 400 }
      );
    }

    // Generate group ID
    const groupId = `group_${Date.now()}`;

    // Create new study group
    const newStudyGroup: StudyGroup = {
      id: groupId,
      name,
      description,
      subject,
      level,
      maxMembers: maxMembers || 10,
      currentMembers: 1,
      members: [
        {
          id: createdBy,
          name: 'Creator', // This would be fetched from user data
          avatar: '/avatars/default.jpg',
          role: 'leader',
          joinDate: new Date().toISOString(),
          contribution: 100,
        },
      ],
      schedule: schedule || [],
      goals: goals || [],
      resources: [],
      isPrivate: isPrivate || false,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    // Add to mock database
    mockStudyGroups.push(newStudyGroup);

    return NextResponse.json({ studyGroup: newStudyGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating study group:', error);
    return NextResponse.json(
      { error: 'Failed to create study group' },
      { status: 500 }
    );
  }
}

// Update a study group
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Study group ID is required' },
        { status: 400 }
      );
    }

    const groupIndex = mockStudyGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Study group not found' },
        { status: 404 }
      );
    }

    // Update study group
    mockStudyGroups[groupIndex] = {
      ...mockStudyGroups[groupIndex],
      ...updates,
    };

    return NextResponse.json({ studyGroup: mockStudyGroups[groupIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating study group:', error);
    return NextResponse.json(
      { error: 'Failed to update study group' },
      { status: 500 }
    );
  }
}

// Delete a study group
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Study group ID is required' },
        { status: 400 }
      );
    }

    const groupIndex = mockStudyGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return NextResponse.json(
        { error: 'Study group not found' },
        { status: 404 }
      );
    }

    // Remove study group
    mockStudyGroups.splice(groupIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting study group:', error);
    return NextResponse.json(
      { error: 'Failed to delete study group' },
      { status: 500 }
    );
  }
}
