import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export type StepNode = {
  key: string
  title?: string
  ask?: string
  say?: string
  options?: { label: string; next: string }[]
  actions?: { tool: string; args?: Record<string, any> }[]
  next?: string
  on_yes?: string | { next: string }
  on_no?: string | { next: string }
  resolution?: string
  close?: boolean
  severity?: string
  handoff?: boolean
}

export type Playbook = {
  issue: string
  metadata?: {
    title?: string
    tags?: string[]
  }
  entry?: { 
    say?: string
    checklist?: string[]
  }
  steps: Record<string, StepNode>
}

export function loadPlaybook(slug: string): Playbook {
  const file = path.join(process.cwd(), 'app/ti/playbooks', `${slug}.yaml`)
  const text = fs.readFileSync(file, 'utf8')
  return yaml.load(text) as Playbook
}

export function getAllPlaybooks(): string[] {
  const playbooksDir = path.join(process.cwd(), 'app/ti/playbooks')
  if (!fs.existsSync(playbooksDir)) {
    return []
  }
  
  return fs.readdirSync(playbooksDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => file.replace('.yaml', ''))
}

export function classifyIssue(description: string): string {
  const keywords = {
    printer: ['impressora', 'imprimir', 'tinta', 'papel', 'driver', 'usb', 'rede', 'hp', 'epson', 'canon', 'samsung'],
    wifi: ['wifi', 'wi-fi', 'internet', 'conexão', 'rede', 'roteador', 'sem fio', 'wireless', 'lan', 'ethernet'],
    software: ['software', 'programa', 'aplicativo', 'instalar', 'atualizar', 'erro', 'excel', 'word', 'powerpoint', 'chrome', 'firefox'],
    hardware: ['computador', 'mouse', 'teclado', 'monitor', 'cabo', 'conexão', 'cpu', 'memória', 'disco', 'hd', 'ssd'],
    email: ['email', 'correio', 'enviar', 'receber', 'outlook', 'gmail', 'yahoo', 'hotmail', 'thunderbird'],
    password: ['senha', 'login', 'acesso', 'bloqueado', 'esqueci', 'password', 'usuário', 'autenticação'],
    network: ['rede', 'servidor', 'firewall', 'vpn', 'proxy', 'dns', 'ip', 'gateway', 'switch'],
    security: ['vírus', 'antivírus', 'malware', 'segurança', 'firewall', 'backup', 'criptografia'],
    performance: ['lento', 'travando', 'congelado', 'performance', 'velocidade', 'memória', 'cpu'],
    mobile: ['celular', 'smartphone', 'tablet', 'android', 'ios', 'iphone', 'samsung', 'xiaomi'],
    audio: ['som', 'áudio', 'microfone', 'caixa', 'fone', 'speaker', 'volume'],
    video: ['vídeo', 'câmera', 'webcam', 'youtube', 'netflix', 'streaming', 'codec'],
    storage: ['arquivo', 'pasta', 'disco', 'hd', 'ssd', 'usb', 'pendrive', 'nuvem', 'onedrive', 'google drive'],
    system: ['windows', 'mac', 'linux', 'sistema', 'atualização', 'reiniciar', 'desligar', 'boot'],
    browser: ['navegador', 'chrome', 'firefox', 'safari', 'edge', 'internet', 'site', 'página'],
    office: ['office', 'word', 'excel', 'powerpoint', 'outlook', 'onedrive', 'teams', 'sharepoint']
  }

  const lowerDesc = description.toLowerCase()
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDesc.includes(word))) {
      return category
    }
  }
  
  return 'general'
}

export function getNextStep(playbook: Playbook, currentStep: string, response: 'yes' | 'no' | string): string | null {
  const step = playbook.steps[currentStep]
  if (!step) return null

  if (response === 'yes' && step.on_yes) {
    return typeof step.on_yes === 'string' ? step.on_yes : step.on_yes.next
  }
  
  if (response === 'no' && step.on_no) {
    return typeof step.on_no === 'string' ? step.on_no : step.on_no.next
  }

  if (step.next) {
    return step.next
  }

  return null
}

export function isResolutionStep(step: StepNode): boolean {
  return step.resolution !== undefined || step.close === true
}

export function isEscalationStep(step: StepNode): boolean {
  return step.handoff === true || step.severity !== undefined
}
