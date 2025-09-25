// app/api/admin/system-messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Verificar se o usuário é admin
async function isAdmin(session: any): Promise<boolean> {
  // Implementar lógica de verificação de admin
  // Por enquanto, assumir que qualquer usuário autenticado é admin
  return !!session?.user
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = path.join(process.cwd(), 'system-message.json')
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'System messages file not found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const config = JSON.parse(fileContent)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error loading system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await request.json()
    
    // Validar estrutura básica
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'system-message.json')
    
    // Fazer backup do arquivo atual
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`
      fs.copyFileSync(filePath, backupPath)
    }

    // Salvar nova configuração
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2))

    return NextResponse.json({ success: true, message: 'Configuration saved successfully' })
  } catch (error) {
    console.error('Error saving system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
