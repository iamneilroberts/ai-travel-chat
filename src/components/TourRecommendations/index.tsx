import { useState, useEffect } from 'react';
import { TourRecommendation } from '@/types/tour';

interface TourRecommendationsProps {
  className?: string;
}

interface RecommendationsResponse {
  recommendations: TourRecommendation[];
  searchParams: any[];
  timestamp: string;
}

export default function TourRecommendations({ className = '' }: TourRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TourRecommendation[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tours/recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch tour recommendations');
      }

      const data: RecommendationsResponse = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error: {error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No tour recommendations available at this time.
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">Recommended Tours</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.tour.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                {recommendation.tour.title}
              </h3>
              
              <div className="flex items-center mb-3">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-gray-700">
                  {recommendation.tour.ratings.toFixed(1)}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">
                  {recommendation.tour.reviews} reviews
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {recommendation.tour.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {recommendation.matchedCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-gray-700">
                  <span className="font-semibold">
                    {recommendation.tour.priceRange.currency}{' '}
                    {recommendation.tour.priceRange.min.toFixed(2)}
                  </span>
                  {recommendation.tour.priceRange.max > recommendation.tour.priceRange.min && (
                    <span className="text-gray-500">
                      {' - '}
                      {recommendation.tour.priceRange.currency}{' '}
                      {recommendation.tour.priceRange.max.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {recommendation.verificationResult && (
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium mr-2">
                      Available
                    </span>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      onClick={() => window.open(`https://www.viator.com/tours/${recommendation.tour.tourId}`, '_blank')}
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <button
          onClick={fetchRecommendations}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Refresh Recommendations
        </button>
      </div>
    </div>
  );
}