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