import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  ViatorLocation, 
  ViatorPriceRange, 
  ViatorSchedule,
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
  bookingConfirmationSettings?: {
    confirmationType: string;
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
      headers: {
        'exp-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'Accept': 'application/json;version=2.0'
      },
    });
  }

  // Transform Viator API response to our tour format
  private transformTourData(data: ViatorProductData): Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'> {
    // TODO: Update transformation logic based on actual API response structure
    // For now, return minimal data
    const defaultLocation: ViatorLocation = {
      city: "Unknown",
      country: "Unknown",
      coordinates: { lat: 0, lon: 0 }
    }

    const defaultPriceRange: ViatorPriceRange = {
      min: 0,
      max: 0,
      currency: "USD"
    }

    const defaultSchedule: ViatorSchedule = {
      dates: [],
      times: [],
      availability: {}
    }

    return {
      tourId: data.productCode || "unknown",
      title: data.title,
      description: data.description,
      location: defaultLocation,
      ratings: 0,
      reviews: 0,
      categories: [],
      duration: "Unknown",
      priceRange: defaultPriceRange,
      schedule: defaultSchedule
    }
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

  // Fetch a single tour by ID
  async getTour(tourId: string): Promise<Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'> | null> {
    try {
      const response = await this.client.get<{ product: ViatorProductData }>(`/products/${tourId}`);
      if (!response.data.product) {
        return null;
      }
      
      return this.transformTourData(response.data.product);
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
      
      // For testing, just get a single product
      const productCode = '5010SYDNEY';  // Sydney Hop-On Hop-Off Tour
      
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
        currency: schedule.currency,
      } : null;

    } catch (error) {
      console.error(`Error checking availability for tour ${tourId}:`, error);
      return null;
    }
  }

  // Initialize the client with environment variables
  static initialize(): ViatorClient {
    const apiKey = process.env.VIATOR_API_KEY;

    if (!apiKey) {
      throw new Error('Missing required Viator API configuration');
    }

    return new ViatorClient({
      apiKey,
      baseUrl: 'https://api.sandbox.viator.com/partner'
    });
  }
}