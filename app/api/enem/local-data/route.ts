import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const questionsPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
    
    // Check if the local database exists
    try {
      await fs.access(questionsPath);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Local ENEM database not found',
        available: false
      });
    }

    const years = await fs.readdir(questionsPath);
    
    const availableYears = [];
    const availableAreas = new Set<string>();
    const yearDetails: any[] = [];
    
    for (const year of years) {
      if (year.match(/^\d{4}$/)) {
        const yearPath = path.join(questionsPath, year);
        
        try {
          const yearStats = await fs.stat(yearPath);
          
          if (yearStats.isDirectory()) {
            const yearNum = parseInt(year);
            availableYears.push(yearNum);
            
            // Get details from details.json
            try {
              const detailsPath = path.join(yearPath, 'details.json');
              const detailsData = await fs.readFile(detailsPath, 'utf-8');
              const yearDetailsData = JSON.parse(detailsData);
              
              yearDetails.push({
                year: yearNum,
                title: yearDetailsData.title,
                disciplines: yearDetailsData.disciplines || [],
                languages: yearDetailsData.languages || [],
                totalQuestions: yearDetailsData.questions?.length || 0
              });
              
              // Add areas to the set
              yearDetailsData.disciplines?.forEach((discipline: any) => {
                availableAreas.add(discipline.value);
              });
            } catch (error) {
              console.warn(`Error reading details for year ${year}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error accessing year ${year}:`, error);
        }
      }
    }
    
    // Sort years in descending order (most recent first)
    availableYears.sort((a, b) => b - a);
    
    return NextResponse.json({
      success: true,
      available: true,
      data: {
        years: availableYears,
        areas: Array.from(availableAreas),
        yearDetails: yearDetails.sort((a, b) => b.year - a.year),
        totalYears: availableYears.length,
        totalAreas: availableAreas.size
      }
    });

  } catch (error) {
    console.error('Error getting local ENEM data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get local ENEM data',
        details: error instanceof Error ? error.message : 'Unknown error',
        available: false
      },
      { status: 500 }
    );
  }
}
