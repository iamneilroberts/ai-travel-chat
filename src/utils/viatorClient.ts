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
  bookingConfirmationSettings: {
    bookingCutoffType: string;
    bookingCutoffInMinutes: number;
    confirmationType: string;
    bookingCutoffFixedTime?: string;
  };
  // Add other fields from the Viator API response
  // that we might need in the future
  productCode: string;
  language: string;
  createdAt: string;
  lastUpdatedAt: string;
  title: string;
  description: string;
  timeZone?: string;
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

interface ModifiedSinceResponse {
  products: ViatorProductData[];
  nextCursor?: string;
}

interface ProductsResponse {
  products: ViatorProductData[];
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

interface SearchType {
  searchType: 'PRODUCTS' | 'DESTINATIONS' | 'ATTRACTIONS';
}

interface FreetextSearchRequest {
  searchTerm: string;
  currency: string;
  searchTypes: Array<SearchType>;
  start: number;
  count: number;
  productFiltering?: {
    destinationIds?: string[];
    locationIds?: string[];
    categories?: string[];
  };
  productSorting?: {
    sortBy: 'RELEVANCE' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'RATING';
    sortOrder: 'ASC' | 'DESC';
  };
}

export interface FreetextSearchProduct {
  productCode: string;
  title: string;
  description?: string;
  location?: {
    id: string;
    name: string;
    destinationId: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  categories?: string[];
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: string;
}

interface FreetextSearchResponse {
  products?: {
    data: FreetextSearchProduct[];
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
    const location = {
      city: data.location?.city || "Unknown",
      country: data.location?.country || "Unknown",
      coordinates: data.location?.coordinates || { lat: 0, lon: 0 }
    };

    const priceRange = {
      min: 0,
      max: 0,
      currency: "USD"
    };

    return {
      tourId: data.productCode || "unknown",
      title: data.title,
      description: data.description,
      location: location,
      ratings: 0,
      reviews: 0,
      categories: [],
      duration: data.timeZone || "Unknown",
      priceRange: priceRange,
      reviewCount: 0,
      ratingAvg: 0,
      status: data.status || 'INACTIVE',
      region: this.determineRegion(location),
      lastSync: new Date()
    };
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

  // Perform a freetext search for tours
  async searchTours(searchTerm: string, options: {
    destinationIds?: string[];
    locationIds?: string[];
    categories?: string[];
    sortBy?: 'RELEVANCE' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'RATING';
    start?: number;
    count?: number;
    currency?: string;
  } = {}): Promise<FreetextSearchResponse | null> {
    try {
      console.log(`Performing freetext search for "${searchTerm}"...`);
      
      const data: FreetextSearchRequest = {
        searchTerm,
        currency: options.currency || 'USD',
        start: options.start || 1,
        count: options.count || 50,
        searchTypes: [{
          searchType: 'PRODUCTS'
        }],
        productFiltering: {
          ...(options.destinationIds && { destinationIds: options.destinationIds }),
          ...(options.locationIds && { locationIds: options.locationIds }),
          ...(options.categories && { categories: options.categories })
        },
        ...(options.sortBy && {
          productSorting: {
            sortBy: options.sortBy,
            sortOrder: options.sortBy === 'PRICE_HIGH_TO_LOW' ? 'DESC' : 'ASC'
          }
        })
      };

      const response = await this.client.post<FreetextSearchResponse>('/search/freetext', data);
      console.log(`Found ${response.data.products?.data.length || 0} results`);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Viator API Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return null;
    }
  }

  // Store the last cursor for future updates
  private async storeLastCursor(cursor: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile('.viator-cursor', cursor);
      console.log('Stored last cursor for future updates');
    } catch (error) {
      console.error('Error storing cursor:', error);
    }
  }

  // Retrieve the last stored cursor
  private async getLastCursor(): Promise<string | undefined> {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile('.viator-cursor', 'utf-8');
    } catch (error) {
      return undefined;
    }
  }

  // Fetch modified products with pagination
  async getModifiedProducts(options: {
    modifiedSince?: string;
    cursor?: string;
    count?: number;
  } = {}): Promise<{
    products: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>[];
    nextCursor?: string;
  }> {
    try {
      const {
        modifiedSince,
        cursor,
        count = 500 // Default to max allowed
      } = options;

      const params: Record<string, string> = {
        count: count.toString()
      };

      if (cursor) {
        params.cursor = cursor;
      }

      if (modifiedSince) {
        params['modified-since'] = encodeURIComponent(modifiedSince);
      }

      const response = await this.client.get<ModifiedSinceResponse>(
        '/products/modified-since',
        { params }
      );

      const transformedProducts = response.data.products
        .filter(product => {
          // Filter out inactive and non-instant confirmation products
          return product.status === 'ACTIVE' && 
                 product.bookingConfirmationSettings?.confirmationType === 'INSTANT';
        })
        .filter(product => product.status === 'ACTIVE' && 
                          product.bookingConfirmationSettings?.confirmationType === 'INSTANT')
        .map(product => this.transformTourData(product));

      return {
        products: transformedProducts,
        nextCursor: response.data.nextCursor
      };
    } catch (error) {
      console.error('Error fetching modified products:', error);
      return { products: [] };
    }
  }

  // Initialize product catalog without date range
  async initializeProductCatalog(): Promise<void> {
    try {
      console.log('Initializing product catalog...');
      let hasMore = true;
      let cursor: string | undefined;
      let totalProcessed = 0;

      while (hasMore) {
        const result = await this.getModifiedProducts({
          count: 500,
          cursor
        });

        totalProcessed += result.products.length;
        console.log(`Processed ${result.products.length} products (Total: ${totalProcessed})`);

        if (result.nextCursor) {
          cursor = result.nextCursor;
          await this.storeLastCursor(cursor);
        } else {
          hasMore = false;
          console.log('Reached end of product catalog');
        }
      }
    } catch (error) {
      console.error('Error initializing product catalog:', error);
      throw error;
    }
  }
}
