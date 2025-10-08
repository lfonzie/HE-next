// Main Orchestration API - Coordinates all 6 steps
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 300

interface WorkflowResult {
  step: number
  name: string
  success: boolean
  data?: any
  error?: string
  duration: number
}

export async function POST(req: NextRequest) {
  const workflowResults: WorkflowResult[] = []
  const startTime = Date.now()

  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    console.log('🚀 Starting Aulas V2 workflow for topic:', topic)

    // Step 1: Theme Filtering
    console.log('📍 Step 1: Theme Filtering')
    const step1Start = Date.now()
    try {
      const filterResponse = await fetch(`${req.nextUrl.origin}/api/aulas-v2/filter-theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!filterResponse.ok) {
        throw new Error('Theme filtering failed')
      }

      const filterData = await filterResponse.json()
      workflowResults.push({
        step: 1,
        name: 'Theme Filtering',
        success: true,
        data: filterData,
        duration: Date.now() - step1Start
      })

      console.log('✅ Step 1 completed:', filterData.filteredTheme)
    } catch (error) {
      workflowResults.push({
        step: 1,
        name: 'Theme Filtering',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - step1Start
      })
      throw error
    }

    const filteredTheme = workflowResults[0].data.filteredTheme

    // Step 2: Search Curiosities
    console.log('📍 Step 2: Search Curiosities')
    const step2Start = Date.now()
    try {
      const curiositiesResponse = await fetch(`${req.nextUrl.origin}/api/aulas-v2/curiosities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: filteredTheme })
      })

      if (!curiositiesResponse.ok) {
        throw new Error('Curiosities search failed')
      }

      const curiositiesData = await curiositiesResponse.json()
      workflowResults.push({
        step: 2,
        name: 'Search Curiosities',
        success: true,
        data: curiositiesData,
        duration: Date.now() - step2Start
      })

      console.log('✅ Step 2 completed:', curiositiesData.curiosities.length, 'curiosities')
    } catch (error) {
      workflowResults.push({
        step: 2,
        name: 'Search Curiosities',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - step2Start
      })
      // Non-critical, continue
      console.warn('⚠️ Step 2 failed, using fallback')
    }

    // Steps 3 & 4: Parallel execution
    console.log('📍 Steps 3 & 4: Lesson Creation and Image Descriptions (Parallel)')
    const parallelStart = Date.now()
    
    try {
      const [lessonResponse, imageDescResponse] = await Promise.all([
        // Step 3: Lesson Creation
        fetch(`${req.nextUrl.origin}/api/aulas-v2/lesson-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: filteredTheme })
        }),
        // Step 4: Image Descriptions
        fetch(`${req.nextUrl.origin}/api/aulas-v2/image-descriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: filteredTheme })
        })
      ])

      // Process Step 3 result
      if (!lessonResponse.ok) {
        throw new Error('Lesson creation failed')
      }
      const lessonData = await lessonResponse.json()
      workflowResults.push({
        step: 3,
        name: 'Lesson Creation',
        success: true,
        data: lessonData,
        duration: Date.now() - parallelStart
      })
      console.log('✅ Step 3 completed:', lessonData.slidesCount, 'slides')

      // Process Step 4 result
      if (!imageDescResponse.ok) {
        throw new Error('Image descriptions failed')
      }
      const imageDescData = await imageDescResponse.json()
      workflowResults.push({
        step: 4,
        name: 'Image Descriptions',
        success: true,
        data: imageDescData,
        duration: Date.now() - parallelStart
      })
      console.log('✅ Step 4 completed:', imageDescData.count, 'descriptions')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (!workflowResults.find(r => r.step === 3)) {
        workflowResults.push({
          step: 3,
          name: 'Lesson Creation',
          success: false,
          error: errorMessage,
          duration: Date.now() - parallelStart
        })
      }
      
      if (!workflowResults.find(r => r.step === 4)) {
        workflowResults.push({
          step: 4,
          name: 'Image Descriptions',
          success: false,
          error: errorMessage,
          duration: Date.now() - parallelStart
        })
      }
      
      throw error
    }

    const lesson = workflowResults.find(r => r.step === 3)?.data.lesson
    const descriptions = workflowResults.find(r => r.step === 4)?.data.descriptions

    // Step 5: Image Generation
    console.log('📍 Step 5: Image Generation')
    const step5Start = Date.now()
    try {
      const imagesResponse = await fetch(`${req.nextUrl.origin}/api/aulas-v2/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme: filteredTheme,
          descriptions 
        })
      })

      if (!imagesResponse.ok) {
        throw new Error('Image generation failed')
      }

      const imagesData = await imagesResponse.json()
      workflowResults.push({
        step: 5,
        name: 'Image Generation',
        success: true,
        data: imagesData,
        duration: Date.now() - step5Start
      })

      console.log('✅ Step 5 completed:', imagesData.count, 'images')
    } catch (error) {
      workflowResults.push({
        step: 5,
        name: 'Image Generation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - step5Start
      })
      // Non-critical, placeholders will be used
      console.warn('⚠️ Step 5 failed, using placeholders')
    }

    const images = workflowResults.find(r => r.step === 5)?.data?.images || []

    // Step 6: Assembly
    console.log('📍 Step 6: Assembly')
    const step6Start = Date.now()
    
    const imageSlides = [1, 3, 6, 9, 11, 14]
    const slidesWithImages = lesson.slides.map((slide: any) => {
      if (imageSlides.includes(slide.slideNumber)) {
        const imageIndex = imageSlides.indexOf(slide.slideNumber)
        return { ...slide, imageUrl: images[imageIndex] || `https://via.placeholder.com/1200x800?text=Image+${imageIndex + 1}` }
      }
      return slide
    })

    const finalLesson = {
      ...lesson,
      slides: slidesWithImages,
      filteredTheme,
      curiosities: workflowResults.find(r => r.step === 2)?.data?.curiosities || [],
      imageDescriptions: descriptions,
      id: `lesson-v2-${Date.now()}`,
      metadata: {
        ...lesson.metadata,
        generatedAt: new Date().toISOString(),
        workflowDuration: Date.now() - startTime,
        systemVersion: '2.0.0'
      }
    }

    workflowResults.push({
      step: 6,
      name: 'Assembly',
      success: true,
      data: { lessonId: finalLesson.id },
      duration: Date.now() - step6Start
    })

    console.log('✅ Step 6 completed')
    console.log(`🎉 Workflow completed in ${Date.now() - startTime}ms`)

    return NextResponse.json({
      success: true,
      lesson: finalLesson,
      workflow: workflowResults,
      totalDuration: Date.now() - startTime,
      message: 'Lesson generated successfully with all 6 workflow steps'
    })

  } catch (error) {
    console.error('❌ Workflow failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Workflow execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        workflow: workflowResults,
        totalDuration: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

