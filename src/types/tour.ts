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

export interface TourBookingInfo {
  confirmationType: 'INSTANT' | 'ON_REQUEST';
  minTravelers?: number;
  maxTravelers?: number;
  bookingQuestions?: string[];
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
  
  // Basic Additional Info
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  languages: string[];
  accessibility: string[];
  tags: number[];
  productUrl: string;
  bookingInfo: TourBookingInfo;
  
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