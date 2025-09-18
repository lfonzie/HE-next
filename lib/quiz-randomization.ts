// lib/quiz-randomization.ts
// Utility functions for randomizing quiz question options

export interface QuizQuestion {
  q: string
  options: string[]
  correct: number | string
  explanation?: string
}

export interface RandomizedQuizQuestion {
  q: string
  options: string[]
  correct: number
  explanation?: string
  originalCorrect: number | string
}

/**
 * Randomizes the order of quiz question options while maintaining the correct answer
 * @param question - The original quiz question
 * @returns A new question with randomized options and updated correct answer index
 */
export function randomizeQuizQuestion(question: QuizQuestion): RandomizedQuizQuestion {
  // Create a copy of the options array
  const options = [...question.options]
  
  // Find the original correct answer index
  let originalCorrectIndex: number
  if (typeof question.correct === 'string') {
    const normalizedCorrect = question.correct.toLowerCase()
    if (normalizedCorrect === 'a') originalCorrectIndex = 0
    else if (normalizedCorrect === 'b') originalCorrectIndex = 1
    else if (normalizedCorrect === 'c') originalCorrectIndex = 2
    else if (normalizedCorrect === 'd') originalCorrectIndex = 3
    else originalCorrectIndex = normalizedCorrect.charCodeAt(0) - 97
  } else {
    originalCorrectIndex = question.correct
  }
  
  // Store the correct answer text
  const correctAnswerText = options[originalCorrectIndex]
  
  // Create array of indices and shuffle them
  const indices = [0, 1, 2, 3]
  const shuffledIndices = shuffleArray(indices)
  
  // Create new options array with shuffled order
  const shuffledOptions = shuffledIndices.map(index => options[index])
  
  // Find the new index of the correct answer
  const newCorrectIndex = shuffledOptions.findIndex(option => option === correctAnswerText)
  
  return {
    q: question.q,
    options: shuffledOptions,
    correct: newCorrectIndex,
    explanation: question.explanation,
    originalCorrect: question.correct
  }
}

/**
 * Randomizes multiple quiz questions
 * @param questions - Array of quiz questions
 * @returns Array of randomized quiz questions
 */
export function randomizeQuizQuestions(questions: QuizQuestion[]): RandomizedQuizQuestion[] {
  return questions.map(question => randomizeQuizQuestion(question))
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Formats options with letters (A, B, C, D) for display
 * @param options - Array of option texts
 * @returns Array of formatted options with letters
 */
export function formatOptionsWithLetters(options: string[]): string[] {
  return options.map((option, index) => {
    const letter = String.fromCharCode(65 + index) // A, B, C, D
    // Remove existing letter prefix if present
    const cleanOption = option.replace(/^[A-D]\)\s*/, '').trim()
    return `${letter}) ${cleanOption}`
  })
}

/**
 * Removes letter prefixes from options
 * @param options - Array of options with letter prefixes
 * @returns Array of clean options without prefixes
 */
export function removeLetterPrefixes(options: string[]): string[] {
  return options.map(option => option.replace(/^[A-D]\)\s*/, '').trim())
}
