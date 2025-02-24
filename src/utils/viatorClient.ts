import axios, { AxiosInstance } from 'axios';
import { 
  ViatorLocation, 
  TourWithParsedJson
} from '../types/tour';

interface ViatorApiConfig {
  apiKey: string;
  baseUrl: string;
}

interface ViatorTag {
  tagId: number;
  parentTagIds?: number[];
  allNamesByLocale: {
    [locale: string]: string;
  };
}

interface TagsResponse {
  tags: ViatorTag[];
}

interface ViatorProductData {
  status: string;
  bookingConfirmationSettings: {
    bookingCutoffType: string;
    bookingCutoffInMinutes: number;
    confirmationType: string;
    bookingCutoffFixedTime?: string;
  };
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
  tags?: number[];
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

interface SearchType {
  searchType: 'PRODUCTS' | 'DESTINATIONS' | 'ATTRACTIONS';
  pagination?: {
    start: number;
    // Maximum allowed count per request is 50
    // See: https://docs.viator.com/partner-api/technical/pagination/
    count: number;
  };
}

interface FreetextSearchRequest {
  searchTerm: string;
  currency: string;
  searchTypes: Array<SearchType>;
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
  tags?: number[];
}

interface FreetextSearchResponse {
  products?: {
    totalCount: number;
    results: FreetextSearchProduct[];
  };
}

export class ViatorClient {
  private client: AxiosInstance;
  private environment: 'sandbox' | 'production';
  private accessLevel: 'basic' | 'full' | 'merchant' = 'basic';
  private allowedEndpoints: Set<string>;
  
  constructor(config: ViatorApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 120000, // 120s timeout as recommended
      headers: {
        'exp-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'Accept': 'application/json;version=2.0',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'AI-Travel-Chat/1.0'
      },
    });

    // Initialize environment and endpoint access
    this.environment = config.baseUrl.includes('sandbox') ? 'sandbox' : 'production';
    this.allowedEndpoints = new Set([
      '/destinations',
      '/attractions/search',
      '/products/search',
      '/search/freetext',
      '/locations/bulk',
      '/products/tags',
      '/products/{product-code}',
      '/products/bulk'
    ]);
  }

  // Get all available tags
  async getTags(): Promise<TagsResponse> {
    try {
      console.log('Fetching Viator tags...');
      const response = await this.client.get<TagsResponse>('/products/tags');
      const tags = response.data.tags || [];
      console.log(`Retrieved ${tags.length} tags`);
      return { tags };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Viator API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        throw new Error(`Failed to fetch tags: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  // Test API connectivity using the destinations endpoint
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Viator API connection...');
      const response = await this.client.get('/destinations');
      console.log('API connection test successful:', {
        status: response.status,
        statusText: response.statusText,
        dataReceived: !!response.data
      });
      if (!response.data) {
        console.warn('API connection successful but no data received');
        return false;
      }
      // Log first destination as a sample
      console.log('Sample destination:', response.data.destinations?.[0] || 'No destinations found');
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
    const sandboxKey = process.env.VIATOR_API_KEY_SANDBOX;
    const productionKey = process.env.VIATOR_API_KEY_PRODUCTION;
    
    let apiKey: string;
    let baseUrl: string;
    
    // Prefer sandbox for development unless explicitly configured for production
    if (sandboxKey && process.env.VIATOR_USE_PRODUCTION !== 'true') {
      console.log('Using sandbox Viator API key for development');
      apiKey = sandboxKey;
      baseUrl = 'https://api.sandbox.viator.com/partner';
    } else if (productionKey) {
      console.log('Using production Viator API key');
      apiKey = productionKey;
      baseUrl = 'https://api.viator.com/partner';
    } else {
      throw new Error(
        'Missing required Viator API configuration. Please set VIATOR_API_KEY_SANDBOX for development.'
      );
    }

    // Log API configuration (without exposing the full key)
    const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
    const environment = baseUrl.includes('sandbox') ? 'sandbox' : 'production';
    console.log('Initializing Viator client:', { baseUrl, maskedKey, environment });

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
    // Validate pagination count
    const requestedCount = options.count || 10;
    if (requestedCount < 1 || requestedCount > 50) {
      throw new Error(
        'Invalid pagination count. Value must be between 1 and 50.'
      );
    }
    const requestData: FreetextSearchRequest = {
      searchTerm,
      currency: options.currency || 'USD',
      searchTypes: [{
        searchType: 'PRODUCTS',
        pagination: {
          start: options.start || 1,
          count: requestedCount
        }
      }],
      productSorting: {
        sortBy: options.sortBy || 'RELEVANCE',
        sortOrder: 'ASC'
      }
    };

    // Only add filtering if we have values
    if (options.destinationIds?.length || options.locationIds?.length || options.categories?.length) {
      requestData.productFiltering = {
        ...(options.destinationIds?.length && { destinationIds: options.destinationIds }),
        ...(options.locationIds?.length && { locationIds: options.locationIds }),
        ...(options.categories?.length && { categories: options.categories })
      };
    }

    try {
      console.log(`Performing freetext search for "${searchTerm}"...`);
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await this.client.post<FreetextSearchResponse>('/search/freetext', requestData);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      console.log(`Found ${response.data.products?.totalCount || 0} total results`);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Viator API Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          request: requestData
        });
        throw new Error(`Viator API error: ${error.response.data?.message || error.message}`);
      }
      throw error;
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
    } catch (_error) {
      return undefined;
    }
  }

  // Get details for a specific set of products using bulk endpoint
  async getBulkProducts(productCodes: string[]): Promise<{
    products: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>[];
  }> {
    try {
      if (productCodes.length === 0) {
        return { products: [] };
      }

      if (productCodes.length > 500) {
        console.warn('Warning: Maximum of 500 products can be requested at once. Truncating list.');
        productCodes = productCodes.slice(0, 500);
      }

      console.log(`Fetching details for ${productCodes.length} products using bulk endpoint...`);
      
      const response = await this.client.post<ViatorBulkProductResponse>(
        '/products/bulk',
        { productCodes }
      );

      const products = Object.values(response.data.products)
        .filter(product => {
          // Filter out inactive and non-instant confirmation products
          return product.status === 'ACTIVE' && 
                 product.bookingConfirmationSettings?.confirmationType === 'INSTANT';
        })
        .map(product => this.transformTourData(product));

      console.log(`Successfully retrieved ${products.length} products`);
      return { products };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Viator API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw new Error(`Viator API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
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
      // Check if endpoint is allowed for current access level
      if (this.accessLevel === 'basic' && this.environment === 'production') {
        throw new Error(
          'The /products/modified-since endpoint requires Full-access or Merchant level API access. ' +
          'Please contact Viator to upgrade your access level.'
        );
      }

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
        .map(product => this.transformTourData(product));

      return {
        products: transformedProducts,
        nextCursor: response.data.nextCursor
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Viator API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          headers: error.config?.headers
        });
        throw new Error(`Viator API error: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unknown error fetching modified products:', error);
        throw error;
      }
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
