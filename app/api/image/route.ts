import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { unsplashService } from '@/lib/unsplash';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - OBRIGATÓRIO
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Clean and optimize the prompt for Unsplash search
    const cleanPrompt = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .slice(0, 50); // Limit length

    if (!cleanPrompt) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    try {
      // Search for educational images on Unsplash
      const searchResult = await unsplashService.searchPhotos(cleanPrompt, 1, 1);
      
      if (searchResult.results && searchResult.results.length > 0) {
        const image = searchResult.results[0];
        
        // Return the image URL directly
        return NextResponse.redirect(image.urls.regular);
      } else {
        // Fallback to education photos if no specific results
        const educationResult = await unsplashService.getEducationPhotos(1, 1);
        
        if (educationResult.results && educationResult.results.length > 0) {
          const image = educationResult.results[0];
          return NextResponse.redirect(image.urls.regular);
        }
      }
    } catch (unsplashError) {
      console.error('Unsplash API error:', unsplashError);
      // Fallback to placeholder if Unsplash fails
    }

    // Final fallback: educational placeholder
    const placeholderUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(cleanPrompt.slice(0, 30))}`;
    
    return NextResponse.redirect(placeholderUrl);
  } catch (error) {
    console.error('Error in image API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
