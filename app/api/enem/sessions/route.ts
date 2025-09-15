import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemSessionRequest, EnemSessionResponse, EnemArea } from '@/types/enem';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface EnemQuestion {
  title: string;
  index: number;
  year: number;
  language: string | null;
  discipline: string;
  context: string;
  files: any[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Array<{
    letter: string;
    text: string;
    file: any;
    isCorrect: boolean;
  }>;
}

async function generateExamFromLocalDB(params: {
  mode: string;
  areas: EnemArea[];
  numQuestions: number;
  timeLimit?: number;
  year?: number;
  difficultyDistribution?: any;
}): Promise<{
  items: any[];
  metadata: {
    estimatedDuration: number;
    difficultyBreakdown: any;
  };
}> {
  const { areas, numQuestions, year } = params;
  
  try {
    // Check if local database exists
    const questionsPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
    await fs.access(questionsPath);
  } catch (error) {
    throw new Error('Local ENEM database not found. Please ensure QUESTOES_ENEM folder exists.');
  }

  // Calculate questions per area
  const questionsPerArea = Math.floor(numQuestions / areas.length);
  const remainingQuestions = numQuestions % areas.length;
  
  let allQuestions: any[] = [];
  
  for (let i = 0; i < areas.length; i++) {
    const areaQuestions = questionsPerArea + (i < remainingQuestions ? 1 : 0);
    
    const areaQuestionsData = await getQuestionsFromLocalDB({
      year,
      discipline: areas[i],
      limit: areaQuestions,
      random: true
    });
    
    // Convert to the format expected by the simulator
    const convertedQuestions = areaQuestionsData.map(question => ({
      item_id: `enem_${question.year}_${question.index}`,
      text: question.context,
      alternatives: {
        A: question.alternatives[0]?.text || '',
        B: question.alternatives[1]?.text || '',
        C: question.alternatives[2]?.text || '',
        D: question.alternatives[3]?.text || '',
        E: question.alternatives[4]?.text || ''
      },
      correct_answer: question.correctAlternative,
      area: question.discipline,
      year: question.year,
      estimated_difficulty: 'medium', // Default difficulty
      metadata: {
        source: 'LOCAL_DATABASE',
        is_official_enem: true,
        original_year: question.year,
        original_index: question.index,
        language: question.language
      }
    }));
    
    allQuestions.push(...convertedQuestions);
  }
  
  // Shuffle all questions
  const shuffledQuestions = shuffleArray(allQuestions);
  
  return {
    items: shuffledQuestions,
    metadata: {
      estimatedDuration: params.timeLimit || (numQuestions * 1.5), // 1.5 minutes per question
      difficultyBreakdown: {
        easy: Math.floor(numQuestions * 0.2),
        medium: Math.floor(numQuestions * 0.6),
        hard: Math.floor(numQuestions * 0.2)
      }
    }
  };
}

async function getQuestionsFromLocalDB(filter: {
  year?: number;
  discipline?: string;
  limit?: number;
  random?: boolean;
}): Promise<EnemQuestion[]> {
  const questionsPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
  
  try {
    // Get available years
    const years = await fs.readdir(questionsPath);
    const availableYears = years.filter(year => 
      year.match(/^\d{4}$/) && 
      fs.stat(path.join(questionsPath, year)).then(stats => stats.isDirectory())
    );

    let allQuestions: EnemQuestion[] = [];

    // If year is specified, only look in that year
    const yearsToSearch = filter.year ? [filter.year.toString()] : availableYears;

    for (const year of yearsToSearch) {
      const yearPath = path.join(questionsPath, year);
      
      try {
        const yearStats = await fs.stat(yearPath);
        if (!yearStats.isDirectory()) continue;

        // Get questions for this year
        const questionsDir = path.join(yearPath, 'questions');
        const questionDirs = await fs.readdir(questionsDir);

        for (const questionDir of questionDirs) {
          const questionPath = path.join(questionsDir, questionDir, 'details.json');
          
          try {
            const questionData = await fs.readFile(questionPath, 'utf-8');
            const question: EnemQuestion = JSON.parse(questionData);
            
            // Apply filters
            if (filter.discipline && question.discipline !== filter.discipline) continue;
            
            allQuestions.push(question);
          } catch (error) {
            console.warn(`Error reading question ${questionDir}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.warn(`Error reading year ${year}:`, error);
        continue;
      }
    }

    // Apply random selection if requested
    if (filter.random) {
      allQuestions = shuffleArray(allQuestions);
    }

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      allQuestions = allQuestions.slice(0, filter.limit);
    }

    return allQuestions;

  } catch (error) {
    console.error('Error reading local database:', error);
    throw new Error('Failed to read local ENEM database');
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication with development bypass
    const session = await auth();
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      console.log('Authentication failed: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized - Please log in to access ENEM simulator' }, { status: 401 });
    }

    // Use development user ID if no session in development
    const userId = session?.user?.id || 'dev-user-123';

    const body: EnemSessionRequest = await request.json();
    
    // Validações mais robustas
    if (!body.mode) {
      return NextResponse.json({ error: 'mode is required' }, { status: 400 });
    }

    if (!body.area || !Array.isArray(body.area) || body.area.length === 0) {
      return NextResponse.json({ error: 'area must be a non-empty array' }, { status: 400 });
    }

    if (!body.config?.num_questions || body.config.num_questions < 5 || body.config.num_questions > 180) {
      return NextResponse.json({ error: 'num_questions must be between 5 and 180' }, { status: 400 });
    }

    // Validar áreas
    const validAreas = ['CN', 'CH', 'LC', 'MT'];
    for (const area of body.area) {
      if (!validAreas.includes(area)) {
        return NextResponse.json({ error: `Invalid area: ${area}` }, { status: 400 });
      }
    }

    // Generate exam using local ENEM database
    console.log('Generating exam from local ENEM database:', {
      mode: body.mode,
      areas: body.area,
      numQuestions: body.config.num_questions,
      year: body.config.year
    });
    
    const examResult = await generateExamFromLocalDB({
      mode: body.mode,
      areas: body.area as EnemArea[],
      numQuestions: body.config.num_questions,
      timeLimit: body.config.time_limit,
      year: body.config.year,
      difficultyDistribution: body.config.difficulty_distribution
    });
    
    console.log('Exam generated successfully from local database:', {
      itemsCount: examResult.items.length,
      metadata: examResult.metadata
    });

    // Try to create session in database, fallback to local storage if database fails
    let sessionId: string;
    try {
      const dbSession = await prisma.enem_session.create({
        data: {
          user_id: userId,
          mode: body.mode as any, // Cast to enum type
          area: Array.isArray(body.area) ? body.area : [body.area], // Ensure it's an array
          config: body.config,
          status: 'ACTIVE' as any // Cast to enum type
        }
      });
      sessionId = dbSession.session_id;
    } catch (dbError) {
      console.warn('Database unavailable, using local storage fallback:', dbError);
      // Generate a unique session ID for local storage
      sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session data in local storage (you could use a file-based storage here)
      // For now, we'll just use the session ID
    }

    const response: EnemSessionResponse = {
      session_id: sessionId,
      items: examResult.items,
      success: true,
      metadata: {
        estimated_duration: examResult.metadata.estimatedDuration,
        difficulty_breakdown: examResult.metadata.difficultyBreakdown
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    try {
      if (sessionId) {
        // Get specific session
        const dbSession = await prisma.enem_session.findUnique({
          where: { 
            session_id: sessionId,
            user_id: session.user.id // Ensure user owns the session
          },
          include: {
            responses: true,
            score: true
          }
        });

        if (!dbSession) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({
          session: dbSession,
          success: true
        });
      } else {
        // Get user's sessions
        const sessions = await prisma.enem_session.findMany({
          where: { user_id: session.user.id },
          orderBy: { start_time: 'desc' },
          take: 20 // Limit to recent sessions
        });

        return NextResponse.json({
          sessions,
          success: true
        });
      }
    } catch (dbError) {
      console.warn('Database unavailable for GET request:', dbError);
      return NextResponse.json({ 
        error: 'Database temporarily unavailable',
        success: false 
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error fetching ENEM sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      success: false 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, status, end_time } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    try {
      // Update session
      const updatedSession = await prisma.enem_session.update({
        where: { 
          session_id,
          user_id: session.user.id // Ensure user owns the session
        },
        data: {
          status: status || undefined,
          end_time: end_time ? new Date(end_time) : undefined,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        session: updatedSession,
        success: true
      });
    } catch (dbError) {
      console.warn('Database unavailable for PUT request:', dbError);
      return NextResponse.json({ 
        error: 'Database temporarily unavailable',
        success: false 
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error updating ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to update session',
      success: false 
    }, { status: 500 });
  }
}
