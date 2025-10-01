// app/api/admin/system-messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const filePath = path.join(process.cwd(), 'system-message.json')
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'System messages file not found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const config = JSON.parse(fileContent)

    return NextResponse.json(config)
  } catch (error) {
    const adminResponse = handleAdminRouteError(error)
    if (adminResponse) {
      return adminResponse
    }

    console.error('Error loading system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

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
    const adminResponse = handleAdminRouteError(error)
    if (adminResponse) {
      return adminResponse
    }

    console.error('Error saving system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
