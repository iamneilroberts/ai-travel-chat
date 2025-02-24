import { PrismaClient } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import fs from 'fs/promises';
import path from 'path';

// Initialize clients
const prisma = new PrismaClient();
const viator = ViatorClient.initialize(); // Use static initialize method

// Tag categories for AI context
const tagCategories = {
  tourTypes: {
    ids: [12026, 13018, 21725], // Helicopter, Bike, Sightseeing
    description: 'Basic tour classifications',
    keywords: ['tour', 'tours', 'sightseeing', 'guided']
  },
  quality: {
    ids: [21972, 22143, 21074, 22099], // Excellent, Best Conversion, Unique, Top Rated
    description: 'Quality and popularity indicators',
    keywords: ['best', 'excellent', 'unique', 'top', 'rated', 'quality']
  },
  features: {
    ids: [11283, 11919, 21956], // Views, Kid-Friendly, Safety
    description: 'Special tour characteristics',
    keywords: ['friendly', 'safety', 'view', 'experience']
  },
  timing: {
    ids: [11922, 18953, 13121], // Multi-day, Evening, Afternoon
    description: 'Time-related aspects',
    keywords: ['day', 'evening', 'morning', 'night', 'afternoon']
  },
  cultural: {
    ids: [21511, 21910], // Cultural, Art & Culture
    description: 'Cultural and artistic experiences',
    keywords: ['cultural', 'art', 'history', 'museum']
  }
};

interface ViatorTag {
  tagId: number;
  parentTagIds?: number[];
  allNamesByLocale: Record<string, string>;
}

interface TagWithMetadata extends ViatorTag {
  category: string;
  description: string;
  significance: string;
}

// Helper function to determine if a string matches any keywords
const matchesKeywords = (text: string, keywords: string[]): boolean => {
  const lowercaseText = text.toLowerCase();
  return keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
};

// Determine tag category based on ID, parent IDs, and name
async function determineTagCategory(tag: ViatorTag): Promise<string> {
  // Check direct ID match
  for (const [category, data] of Object.entries(tagCategories)) {
    if (data.ids.includes(tag.tagId)) {
      return category;
    }
  }

  // Check parent IDs
  if (tag.parentTagIds) {
    for (const parentId of tag.parentTagIds) {
      for (const [category, data] of Object.entries(tagCategories)) {
        if (data.ids.includes(parentId)) {
          return category;
        }
      }
    }
  }

  // Check name for keywords
  const englishName = tag.allNamesByLocale.en;
  for (const [category, data] of Object.entries(tagCategories)) {
    if (matchesKeywords(englishName, data.keywords)) {
      return category;
    }
  }

  return 'other';
}

// Generate description and significance for AI context
async function generateTagDescription(tag: ViatorTag, category: string): Promise<{ description: string; significance: string }> {
  const englishName = tag.allNamesByLocale.en;
  const hasParents = tag.parentTagIds && tag.parentTagIds.length > 0;
  
  let description = `${englishName} - A tag for categorizing ${category} tours`;
  let significance = hasParents
    ? `This tag is part of a broader category and helps identify specific ${englishName.toLowerCase()} options within tours`
    : `This is a top-level tag that categorizes tours as ${englishName.toLowerCase()} experiences`;

  return { description, significance };
}

// Save tag data to file for debugging
async function saveTagData(tags: ViatorTag[], filename: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join('testing', `${filename}_${timestamp}.log`);
  await fs.writeFile(outputPath, JSON.stringify({ tags }, null, 2));
  console.log(`Tag data saved to ${outputPath}`);
}

// Main function to fetch and process tags
async function fetchAndProcessTags() {
  try {
    console.log('Fetching tags from Viator API...');
    const response = await viator.getTags();
    const tags: ViatorTag[] = response.tags;

    // Save raw tag data
    await saveTagData(tags, 'viator_tag_ingestion');

    console.log('Processing tags...');
    const processedTags: TagWithMetadata[] = [];

    for (const tag of tags) {
      const category = await determineTagCategory(tag);
      const { description, significance } = await generateTagDescription(tag, category);

      processedTags.push({
        ...tag,
        category,
        description,
        significance,
      });
    }

    console.log('Upserting tags to database...');
    await Promise.all(
      processedTags.map((tag) =>
        prisma.tag.upsert({
          where: { id: tag.tagId },
          update: {
            name: tag.allNamesByLocale.en,
            description: tag.description,
            significance: tag.significance,
            category: tag.category,
            parentIds: tag.parentTagIds || [],
            lastUpdated: new Date(),
          },
          create: {
            id: tag.tagId,
            name: tag.allNamesByLocale.en,
            description: tag.description,
            significance: tag.significance,
            category: tag.category,
            parentIds: tag.parentTagIds || [],
            lastUpdated: new Date(),
          },
        })
      )
    );

    console.log('Tag ingestion completed successfully');
  } catch (error) {
    console.error('Error during tag ingestion:', error);
    throw error;
  }
}

// Run the script
fetchAndProcessTags()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });