import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const ticketSchema = z.object({
  sessionId: z.string(),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).default('P3'),
  summary: z.string(),
  details: z.string(),
  assignedTo: z.string().optional(),
  externalRef: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, priority, summary, details, assignedTo, externalRef } = ticketSchema.parse(body)

    // Verify session exists
    const session = await prisma.tiSession.findUnique({
      where: { id: sessionId },
      include: { steps: true }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Create the ticket
    const ticket = await prisma.tiTicket.create({
      data: {
        sessionId,
        priority,
        summary,
        details,
        assignedTo,
        externalRef
      }
    })

    // Update session status to escalated
    await prisma.tiSession.update({
      where: { id: sessionId },
      data: {
        status: 'escalated',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        priority: ticket.priority,
        summary: ticket.summary,
        createdAt: ticket.createdAt,
        assignedTo: ticket.assignedTo,
        externalRef: ticket.externalRef
      },
      message: 'Ticket created successfully'
    })

  } catch (error) {
    console.error('Ticket creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve tickets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = sessionId ? { sessionId } : {}

    const tickets = await prisma.tiTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        // Include session info if needed
      }
    })

    const total = await prisma.tiTicket.count({ where })

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Ticket retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve tickets' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update ticket
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, priority, summary, details, assignedTo, externalRef } = z.object({
      id: z.string(),
      priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
      summary: z.string().optional(),
      details: z.string().optional(),
      assignedTo: z.string().optional(),
      externalRef: z.string().optional()
    }).parse(body)

    const ticket = await prisma.tiTicket.update({
      where: { id },
      data: {
        ...(priority && { priority }),
        ...(summary && { summary }),
        ...(details && { details }),
        ...(assignedTo && { assignedTo }),
        ...(externalRef && { externalRef })
      }
    })

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket updated successfully'
    })

  } catch (error) {
    console.error('Ticket update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
