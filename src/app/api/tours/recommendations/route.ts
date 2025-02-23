import { NextResponse } from 'next/server';
import { TourService } from '@/utils/tourService';
import { ViatorClient } from '@/utils/viatorClient';
import { TourSearchParams, TourRecommendation } from '@/types/tour';
import fs from 'fs';
import path from 'path';

// Read trip details from the markdown file
async function getTripDetails(): Promise<string> {
  const filePath = path.join(process.cwd(), 'src', 'utils', 'trip-details.md');
  return fs.promises.readFile(filePath, 'utf-8');
}

// Generate search parameters using AI
async function generateSearchParams(tripDetails: string): Promise<TourSearchParams[]> {
  const prompt = `
    Given the following trip details:
    ${tripDetails}
    
    Please generate a JSON array of search parameters for finding relevant Viator tours.
    Each object should include relevant location, categories, and other filters.
    Return only the JSON array without any additional text.
    
    Example format:
    [
      {
        "location": "Rome",
        "categories": ["Historical", "Cultural"],
        "minRating": 4.5
      }
    ]
  `;

  try {
    const response = await fetch(process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-2.1',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.content[0].text);
    return content as TourSearchParams[];
  } catch (error) {
    console.error('Error generating search parameters:', error);
    // Return a default search parameter if AI fails
    return [{
      minRating: 4.0
    }];
  }
}

// Score tour relevance based on trip details
function calculateRelevanceScore(
  tour: Awaited<ReturnType<typeof TourService.getTourById>>,
  tripDetails: string
): number {
  if (!tour) return 0;

  let score = 0;

  // Base score from ratings
  score += tour.ratings * 0.5;

  // Keywords matching
  const keywords = tripDetails.toLowerCase().split(/\W+/);
  const tourText = `${tour.title} ${tour.description}`.toLowerCase();
  
  keywords.forEach(keyword => {
    if (keyword.length > 3 && tourText.includes(keyword)) {
      score += 0.5;
    }
  });

  // Category matching
  tour.categories.forEach(category => {
    if (tripDetails.toLowerCase().includes(category.toLowerCase())) {
      score += 1;
    }
  });

  return Math.min(10, score); // Cap at 10
}

export async function GET(): Promise<NextResponse> {
  try {
    // Step 1: Get current trip details
    const tripDetails = await getTripDetails();
    
    // Step 2: Generate search parameters using AI
    const searchParams = await generateSearchParams(tripDetails);
    
    // Step 3: Search local database for tours
    const allTours: TourRecommendation[] = [];
    
    for (const params of searchParams) {
      const tours = await TourService.searchTours(params);
      
      // Step 4: Calculate relevance scores
      const scoredTours = tours.map(tour => ({
        tour,
        relevanceScore: calculateRelevanceScore(tour, tripDetails),
        matchedCategories: tour.categories.filter(category =>
          tripDetails.toLowerCase().includes(category.toLowerCase())
        ),
        verificationResult: null
      }));
      
      allTours.push(...scoredTours);
    }
    
    // Step 5: Sort by relevance and take top 5
    const topTours = allTours
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
    
    // Step 6: Verify availability for top tours
    const viatorClient = ViatorClient.initialize();
    
    const verifiedTours = await Promise.all(
      topTours.map(async (recommendation) => {
        try {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          
          const availability = await viatorClient.checkAvailability(
            recommendation.tour.tourId,
            tomorrowStr
          );
          
          return {
            ...recommendation,
            verificationResult: availability
          };
        } catch (error) {
          console.error(`Error verifying tour ${recommendation.tour.tourId}:`, error);
          return recommendation;
        }
      })
    );
    
    // Step 7: Return only available tours
    const availableTours = verifiedTours.filter(
      tour => tour.verificationResult?.available
    );
    
    return NextResponse.json({
      recommendations: availableTours,
      searchParams,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting tour recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get tour recommendations' },
      { status: 500 }
    );
  }
}