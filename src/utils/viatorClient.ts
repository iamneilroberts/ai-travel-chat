import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  ViatorLocation, 
  ViatorPriceRange, 
  TourWithParsedJson
} from '../types/tour';

interface ViatorApiConfig {
  apiKey: string;
  baseUrl: string;
}

interface ViatorProductData {
  status: string;
  productCode: string;
  language: string;
  createdAt: string;
  lastUpdatedAt: string;
  title: string;
  description: string;
  timeZone?: string;
  // Optional location fields for future extensibility
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
}

interface ViatorBulkProductResponse {
  products: {
    [productCode: string]: ViatorProductData;
  };
}

interface ViatorAvailabilityResponse {
  data: {
    available: boolean;
    schedules: Array<{
      available: boolean;
      price: number;
      currency: string;
    }>;
  };
}

export class ViatorClient {
  private client: AxiosInstance;
  
  constructor(config: ViatorApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 120000, // 120s timeout as recommended
      headers: {
        'exp-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'Accept': 'application/json;version=2.0',
        'Accept-Encoding': 'gzip'
      },
    });
  }

  // Test API connectivity using the destinations endpoint
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/destinations');
      console.log('API test response:', response.data);
      return true;
    } catch (error) {
      console.error('API test error:', error);
      return false;
    }
  }

  // Transform Viator API response to our tour format
  private transformTourData(data: ViatorProductData): Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'> {
    // Hardcoded location mapping for known tours
    const locationMap: { [key: string]: ViatorLocation } = {
      '2065LHR': {
        city: 'London',
        country: 'United Kingdom',
        coordinates: { lat: 51.5074, lon: -0.1278 }
      }
    };

    const defaultLocation: ViatorLocation = 
      locationMap[data.productCode] || {
        city: data.location?.city || "Unknown",
        country: data.location?.country || "Unknown",
        coordinates: data.location?.coordinates 
          ? { 
              lat: data.location.coordinates.lat, 
              lon: data.location.coordinates.lon 
            } 
          : { lat: 0, lon: 0 }
      };

    const defaultPriceRange: ViatorPriceRange = {
      min: 0,
      max: 0,
      currency: "USD"
    }

    return {
      tourId: data.productCode || "unknown",
      title: data.title,
      description: data.description,
      location: defaultLocation,
      ratings: 0,
      reviews: 0,
      categories: [],
      duration: data.timeZone || "Unknown", // Use timeZone if available
      priceRange: defaultPriceRange,
      reviewCount: 0,
      ratingAvg: 0,
      status: data.status || 'INACTIVE',
      region: this.determineRegion(defaultLocation),
      lastSync: new Date()
    }
  }

  // Fetch a single tour by ID
  async getTour(tourId: string): Promise<Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'> | null> {
    try {
      console.log(`Fetching tour details for ${tourId}...`);
      const response = await this.client.get<ViatorProductData>(`/products/${tourId}`);
      
      if (!response.data) {
        console.log('No data received from API');
        return null;
      }
      
      console.log('API Response:', {
        productCode: response.data.productCode,
        title: response.data.title,
        location: response.data.location
      });
      
      const transformedData = this.transformTourData(response.data);
      console.log('Transformed tour data:', transformedData);
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching tour ${tourId}:`, error);
      return null;
    }
  }

  // Fetch multiple tours (with pagination)
  async getTours(page: number = 1, limit: number = 100): Promise<{
    tours: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>[];
    hasMore: boolean;
  }> {
    try {
      // Calculate start and end indices for pagination
      const start = (page - 1) * limit;
      
      // For testing, use a London tour
      const productCode = '2065LHR';  // London tour
      
      const response = await this.client.get<ViatorProductData>(
        `/products/${productCode}`
      );

      // Log a concise summary instead of the full response
      console.log('Tour Summary:', {
        productCode: response.data.productCode,
        title: response.data.title,
        status: response.data.status,
        lastUpdated: response.data.lastUpdatedAt
      });
      
      if (!response.data) {
        return { tours: [], hasMore: false };
      }

      const tours = [this.transformTourData(response.data)];
      
      // For testing, we'll just return one tour
      const hasMore = false;
      return {
        tours,
        hasMore
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Error fetching tours:', axiosError.response?.data || axiosError.message);
      } else {
        console.error('Error fetching tours:', error);
      }
      return { tours: [], hasMore: false };
    }
  }

  // Helper method to determine region based on location
  private determineRegion(location: ViatorLocation): string {
    const supportedRegions: { [key: string]: string[] } = {
      'UK': ['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Ireland': ['Ireland', 'Republic of Ireland'],
      'Italy': ['Italy'],
      'France': ['France'],
      'Caribbean': ['Jamaica', 'Bahamas', 'Dominican Republic', 'Puerto Rico', 'Cuba']
    };

    for (const [region, countries] of Object.entries(supportedRegions)) {
      if (countries.includes(location.country)) {
        return region;
      }
    }

    return 'Other';
  }

  // Initialize the client with environment variables
  static initialize(): ViatorClient {
    const apiKey = process.env.VIATOR_API_KEY;
    const baseUrl = process.env.VIATOR_BASE_URL || 'https://api.sandbox.viator.com/partner';

    if (!apiKey) {
      throw new Error('Missing required Viator API configuration');
    }

    return new ViatorClient({
      apiKey,
      baseUrl
    });
  }

  // Check tour availability for a specific date and time
  async checkAvailability(tourId: string, date: string, time?: string): Promise<{
    available: boolean;
    price: number;
    currency: string;
  } | null> {
    try {
      const response = await this.client.get<ViatorAvailabilityResponse>(
        `/availability/schedules/${tourId}`,
        {
          params: { date, time },
        }
      );

      const schedule = response.data.data.schedules[0];
      return schedule ? {
        available: schedule.available,
        price: schedule.price,
        currency: 'USD', // Default to USD, can be updated based on API response
      } : null;

    } catch (error) {
      console.error(`Error checking availability for tour ${tourId}:`, error);
      return null;
    }
  }
}
