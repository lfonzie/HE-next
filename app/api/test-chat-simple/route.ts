import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body
    
    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    // Resposta simples para teste
    return new Response(`Resposta de teste para: "${message}"`, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Test': 'simple'
      }
    })

  } catch (error: any) {
    return Response.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    )
  }
}
