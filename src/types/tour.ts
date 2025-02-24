// Types for Viator Tours with simplified data structure

export interface ViatorLocation {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  address?: string;
  pickupPoints?: string[];
}

export interface ViatorPriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface TourWithParsedJson {
  id: string;
  tourId: string;
  title: string;
  description: string;
  location: ViatorLocation;
  ratings: number;
  reviews: number;
  categories: string[];
  duration: string;
  priceRange: ViatorPriceRange;
  
  // Review data
  reviewCount: number;
  ratingAvg: number;
  
  // Metadata
  status: string;
  region: string;
  lastSync: Date;
  updatedAt: Date;
  createdAt: Date;
}

// Type alias for Prisma Tour model
export type Tour = TourWithParsedJson;

// Search parameters for filtering tours
export interface TourSearchParams {
  location?: string;
  categories?: string[];
  minRating?: number;
  maxPrice?: number;
}

// Helper functions for JSON field handling
export const parseTourJson = (tour: any): TourWithParsedJson => {
  return {
    ...tour,
    location: typeof tour.location === 'string' ? JSON.parse(tour.location) : tour.location,
    priceRange: typeof tour.priceRange === 'string' ? JSON.parse(tour.priceRange) : tour.priceRange,
  };
};

export const stringifyTourJson = (tour: TourWithParsedJson): any => {
  return {
    ...tour,
    location: typeof tour.location === 'object' ? JSON.stringify(tour.location) : tour.location,
    priceRange: typeof tour.priceRange === 'object' ? JSON.stringify(tour.priceRange) : tour.priceRange,
  };
};