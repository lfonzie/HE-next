import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/hooks/useCommunityForums';

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
  {
    id: 'post_003',
    title: 'Dicas para o ENEM 2024',
    content: 'Compartilhando algumas dicas importantes para o ENEM 2024. Espero que ajudem!',
    author: {
      id: 'user_005',
      name: 'Carlos Mendes',
      avatar: '/avatars/carlos.jpg',
      role: 'teacher',
      badges: [
        {
          id: 'badge_004',
          name: 'Especialista ENEM',
          icon: '🎓',
          color: 'text-purple-600',
          description: 'Especialista em preparação para ENEM',
        },
      ],
      reputation: 3200,
      joinDate: '2023-07-01T00:00:00Z',
    },
    forumId: 'forum_001',
    createdAt: '2023-12-13T09:15:00Z',
    updatedAt: '2023-12-13T09:15:00Z',
    tags: ['enem', 'dicas', 'preparação', 'vestibular'],
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    views: 350,
    likes: 45,
    dislikes: 2,
    replies: [
      {
        id: 'reply_003',
        content: 'Ótimas dicas! Obrigado por compartilhar.',
        author: {
          id: 'user_006',
          name: 'Fernanda Oliveira',
          avatar: '/avatars/fernanda.jpg',
          role: 'student',
          badges: [],
          reputation: 200,
          joinDate: '2023-11-15T00:00:00Z',
        },
        createdAt: '2023-12-13T10:00:00Z',
        updatedAt: '2023-12-13T10:00:00Z',
        likes: 5,
        dislikes: 0,
        isSolution: false,
        attachments: [],
      },
    ],
    attachments: [
      {
        id: 'attachment_001',
        name: 'Dicas_ENEM_2024.pdf',
        type: 'document',
        url: '/attachments/dicas_enem_2024.pdf',
        size: 1024000,
        uploadedAt: '2023-12-13T09:15:00Z',
      },
    ],
    status: 'published',
  },
];

// Get all posts
export async function GET(req: NextRequest) {
  try {
    const forumId = req.nextUrl.searchParams.get('forumId');
    const search = req.nextUrl.searchParams.get('search');
    const authorId = req.nextUrl.searchParams.get('authorId');
    const tags = req.nextUrl.searchParams.get('tags');

    let filteredPosts = mockPosts;

    if (forumId) {
      filteredPosts = filteredPosts.filter(post => post.forumId === forumId);
    }

    if (authorId) {
      filteredPosts = filteredPosts.filter(post => post.author.id === authorId);
    }

    if (search) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredPosts = filteredPosts.filter(post =>
        tagList.some(tag => post.tags.some(postTag => postTag.toLowerCase().includes(tag)))
      );
    }

    // Sort by pinned first, then by creation date
    filteredPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ posts: filteredPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const {
      title,
      content,
      author,
      forumId,
      tags,
      attachments,
      isPinned,
      isLocked,
      isAnnouncement,
    } = await req.json();

    if (!title || !content || !author || !forumId) {
      return NextResponse.json(
        { error: 'Title, content, author, and forumId are required' },
        { status: 400 }
      );
    }

    // Generate post ID
    const postId = `post_${Date.now()}`;

    // Create new post
    const newPost: Post = {
      id: postId,
      title,
      content,
      author,
      forumId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      isPinned: isPinned || false,
      isLocked: isLocked || false,
      isAnnouncement: isAnnouncement || false,
      views: 0,
      likes: 0,
      dislikes: 0,
      replies: [],
      attachments: attachments || [],
      status: 'published',
    };

    // Add to mock database
    mockPosts.push(newPost);

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Update a post
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Update post
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ post: mockPosts[postIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const postIndex = mockPosts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Remove post
    mockPosts.splice(postIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
