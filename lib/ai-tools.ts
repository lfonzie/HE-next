import { generateObject } from 'ai'
import { z } from 'zod'
import { aiConfig } from './ai-sdk-config'

export const educationalTools = {
  createLesson: {
    description: 'Create an educational lesson',
    parameters: z.object({
      topic: z.string(),
      level: z.string(),
      duration: z.number(),
    }),
  },
  generateQuiz: {
    description: 'Generate a quiz for a topic',
    parameters: z.object({
      topic: z.string(),
      questions: z.number(),
      difficulty: z.string(),
    }),
  },
  createSummary: {
    description: 'Create a summary of content',
    parameters: z.object({
      content: z.string(),
      length: z.string(),
    }),
  },
  solveMathProblem: {
    description: 'Solve a math problem',
    parameters: z.object({
      problem: z.string(),
      showSteps: z.boolean(),
    }),
  },
  explainConcept: {
    description: 'Explain a concept',
    parameters: z.object({
      concept: z.string(),
      level: z.string(),
    }),
  },
  createStudyGuide: {
    description: 'Create a study guide',
    parameters: z.object({
      topic: z.string(),
      format: z.string(),
    }),
  },
  analyzePerformance: {
    description: 'Analyze student performance',
    parameters: z.object({
      scores: z.array(z.number()),
      subject: z.string(),
    }),
  },
}

export async function callEducationalTool(toolName: string, parameters: any) {
  try {
    const tool = educationalTools[toolName as keyof typeof educationalTools]
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`)
    }

    const result = await generateObject({
      model: aiConfig.openai(aiConfig.model),
      schema: tool.parameters,
      prompt: `Execute ${tool.description} with parameters: ${JSON.stringify(parameters)}`,
    })

    return result.object
  } catch (error) {
    console.error(`Error calling tool ${toolName}:`, error)
    throw error
  }
}

export default educationalTools
