import { prisma } from '@/lib/prisma'
import { loadPlaybook, classifyIssue, getNextStep, isResolutionStep, isEscalationStep, type Playbook, type StepNode } from '@/app/ti/lib/playbook'
import { AIPlaybookGenerator, type GeneratedPlaybook } from '@/app/ti/lib/ai-playbook-generator'

export class TiSessionManager {
  private sessionId: string
  private userId: string
  private playbook: Playbook | null = null
  private generatedPlaybook: GeneratedPlaybook | null = null
  private currentStep: string | null = null
  private aiGenerator: AIPlaybookGenerator

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId
    this.userId = userId
    this.aiGenerator = AIPlaybookGenerator.getInstance()
  }

  async initialize(issueDescription: string, deviceLabel?: string): Promise<void> {
    // Classify the issue to determine which playbook to use
    const issueType = classifyIssue(issueDescription)
    
    // Try to load existing playbook first
    try {
      this.playbook = loadPlaybook(issueType)
      console.log(`Loaded existing playbook: ${issueType}`)
    } catch (error) {
      console.log(`No existing playbook for ${issueType}, generating with AI...`)
      
      // Generate playbook using AI
      this.generatedPlaybook = await this.aiGenerator.generatePlaybook(issueDescription, {
        issueType,
        deviceLabel,
        userId: this.userId
      })
      
      // Convert generated playbook to standard format
      this.playbook = this.convertGeneratedToStandard(this.generatedPlaybook)
    }
    
    // Create or update the TI session
    await prisma.tiSession.upsert({
      where: { id: this.sessionId },
      update: {
        issueType,
        deviceLabel,
        status: 'active',
        updatedAt: new Date()
      },
      create: {
        id: this.sessionId,
        userId: this.userId,
        issueType,
        deviceLabel,
        status: 'active'
      }
    })

    // Set initial step
    this.currentStep = this.playbook.entry?.checklist?.[0] || 'check_power'
  }

  async executeStep(stepKey: string, userResponse?: string): Promise<{
    step: StepNode
    nextSteps: string[]
    actions: any[]
    message: string
    isComplete: boolean
    needsEscalation: boolean
  }> {
    if (!this.playbook) {
      throw new Error('Playbook not initialized')
    }

    const step = this.playbook.steps[stepKey]
    if (!step) {
      throw new Error(`Step ${stepKey} not found in playbook`)
    }

    // Update step status
    await this.updateStepStatus(stepKey, 'done', userResponse)

    // Execute any actions for this step
    const actionResults = await this.executeStepActions(step)

    // Determine next steps
    let nextStepKey: string | null = null
    if (userResponse) {
      nextStepKey = getNextStep(this.playbook, stepKey, userResponse)
    } else if (step.next) {
      nextStepKey = step.next
    }

    // Check if this is a resolution or escalation step
    const isComplete = isResolutionStep(step)
    const needsEscalation = isEscalationStep(step)

    if (isComplete) {
      await this.resolveSession(step.resolution || 'resolved')
    } else if (needsEscalation) {
      await this.escalateSession(step.severity || 'P3')
    }

    // Get available next steps
    const nextSteps = nextStepKey ? [nextStepKey] : []
    if (this.playbook.entry?.checklist) {
      const remainingSteps = this.playbook.entry.checklist.filter(s => s !== stepKey)
      nextSteps.push(...remainingSteps)
    }

    return {
      step,
      nextSteps,
      actions: actionResults,
      message: step.say || step.ask || '',
      isComplete,
      needsEscalation
    }
  }

  private async executeStepActions(step: StepNode): Promise<any[]> {
    if (!step.actions) return []

    const results = []
    for (const action of step.actions) {
      try {
        // Import and execute the tool
        const { tools } = await import('@/app/api/ti/tools')
        const tool = tools[action.tool as keyof typeof tools]
        
        if (tool) {
          const result = await tool.execute(action.args || {})
          results.push({
            tool: action.tool,
            args: action.args,
            result
          })
        }
      } catch (error) {
        results.push({
          tool: action.tool,
          args: action.args,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  private async updateStepStatus(stepKey: string, status: string, notes?: string): Promise<void> {
    await prisma.tiStep.upsert({
      where: {
        sessionId_key: {
          sessionId: this.sessionId,
          key: stepKey
        }
      },
      update: {
        status,
        notes,
        updatedAt: new Date()
      },
      create: {
        sessionId: this.sessionId,
        key: stepKey,
        title: this.playbook?.steps[stepKey]?.title || stepKey,
        status,
        notes
      }
    })
  }

  private async resolveSession(resolution: string): Promise<void> {
    await prisma.tiSession.update({
      where: { id: this.sessionId },
      data: {
        status: 'resolved',
        resolution,
        updatedAt: new Date()
      }
    })
  }

  private async escalateSession(priority: string): Promise<void> {
    await prisma.tiSession.update({
      where: { id: this.sessionId },
      data: {
        status: 'escalated',
        updatedAt: new Date()
      }
    })

    // Create a ticket
    await this.createTicket(priority)
  }

  private async createTicket(priority: string): Promise<void> {
    const session = await prisma.tiSession.findUnique({
      where: { id: this.sessionId },
      include: { steps: true }
    })

    if (!session) return

    const summary = `TI Support: ${session.issueType} - ${session.deviceLabel || 'Unknown device'}`
    const details = `Session ID: ${this.sessionId}\nIssue Type: ${session.issueType}\nDevice: ${session.deviceLabel}\nSteps Completed: ${session.steps.length}\nResolution: ${session.resolution || 'Escalated for manual intervention'}`

    await prisma.tiTicket.create({
      data: {
        sessionId: this.sessionId,
        priority,
        summary,
        details
      }
    })
  }

  async getSessionStatus(): Promise<{
    session: any
    steps: any[]
    currentStep: string | null
    playbook: Playbook | null
  }> {
    const session = await prisma.tiSession.findUnique({
      where: { id: this.sessionId },
      include: { steps: true }
    })

    return {
      session,
      steps: session?.steps || [],
      currentStep: this.currentStep,
      playbook: this.playbook
    }
  }

  async updateTranscript(messages: any[]): Promise<void> {
    await prisma.tiSession.update({
      where: { id: this.sessionId },
      data: {
        transcript: messages,
        updatedAt: new Date()
      }
    })
  }

  getCurrentStep(): string | null {
    return this.currentStep
  }

  setCurrentStep(stepKey: string): void {
    this.currentStep = stepKey
  }

  getPlaybook(): Playbook | null {
    return this.playbook
  }

  getGeneratedPlaybook(): GeneratedPlaybook | null {
    return this.generatedPlaybook
  }

  private convertGeneratedToStandard(generated: GeneratedPlaybook): Playbook {
    return {
      issue: generated.issue,
      metadata: generated.metadata,
      entry: generated.entry,
      steps: generated.steps
    }
  }

  // Method to regenerate playbook with more context
  async regeneratePlaybook(additionalContext: string): Promise<void> {
    if (!this.generatedPlaybook) {
      return // Only regenerate if we have a generated playbook
    }

    const currentDescription = this.generatedPlaybook.metadata.title
    const newDescription = `${currentDescription}. Contexto adicional: ${additionalContext}`
    
    this.generatedPlaybook = await this.aiGenerator.generatePlaybook(newDescription, {
      previousPlaybook: this.generatedPlaybook,
      additionalContext
    })
    
    this.playbook = this.convertGeneratedToStandard(this.generatedPlaybook)
  }
}
