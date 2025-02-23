import { Prisma } from '@prisma/client';
import prisma from './prismaClient';
import {
  Tour,
  TourWithParsedJson,
  TourSearchParams,
  parseTourJson,
  stringifyTourJson,
} from '../types/tour';

export class TourService {
  // Create a new tour
  static async createTour(data: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>): Promise<TourWithParsedJson> {
    const tourData = stringifyTourJson(data as TourWithParsedJson);
    const createInput: Prisma.TourCreateInput = {
      tourId: tourData.tourId,
      title: tourData.title,
      description: tourData.description,
      location: tourData.location as Prisma.InputJsonValue,
      ratings: tourData.ratings,
      reviews: tourData.reviews,
      categories: tourData.categories,
      duration: tourData.duration,
      priceRange: tourData.priceRange as Prisma.InputJsonValue,
      schedule: tourData.schedule 
        ? (tourData.schedule as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    };

    const tour = await prisma.tour.create({
      data: createInput,
    });
    return parseTourJson(tour);
  }

  // Get a tour by ID
  static async getTourById(id: string): Promise<TourWithParsedJson | null> {
    const tour = await prisma.tour.findUnique({
      where: { id },
    });
    return tour ? parseTourJson(tour) : null;
  }

  // Get a tour by Viator ID
  static async getTourByViatorId(tourId: string): Promise<TourWithParsedJson | null> {
    const tour = await prisma.tour.findUnique({
      where: { tourId },
    });
    return tour ? parseTourJson(tour) : null;
  }

  // Update a tour
  static async updateTour(id: string, data: Partial<TourWithParsedJson>): Promise<TourWithParsedJson> {
    const tourData = stringifyTourJson(data as TourWithParsedJson);
    const updateInput: Prisma.TourUpdateInput = {
      title: tourData.title,
      description: tourData.description,
      location: tourData.location as Prisma.InputJsonValue,
      ratings: tourData.ratings,
      reviews: tourData.reviews,
      categories: tourData.categories,
      duration: tourData.duration,
      priceRange: tourData.priceRange as Prisma.InputJsonValue,
      schedule: tourData.schedule 
        ? (tourData.schedule as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      updatedAt: new Date(),
    };

    const tour = await prisma.tour.update({
      where: { id },
      data: updateInput,
    });
    return parseTourJson(tour);
  }

  // Delete a tour
  static async deleteTour(id: string): Promise<void> {
    await prisma.tour.delete({
      where: { id },
    });
  }

  // Search tours with filters
  static async searchTours(params: TourSearchParams): Promise<TourWithParsedJson[]> {
    const where: Prisma.TourWhereInput = {};

    // Build the where clause based on search parameters
    if (params.location) {
      where.location = {
        path: ['city'],
        string_contains: params.location,
        mode: 'insensitive',
      };
    }

    if (params.categories?.length) {
      where.categories = {
        hasEvery: params.categories,
      };
    }

    if (params.minRating) {
      where.ratings = {
        gte: params.minRating,
      };
    }

    if (params.maxPrice) {
      where.priceRange = {
        path: ['max'],
        lte: params.maxPrice,
      };
    }

    const tours = await prisma.tour.findMany({
      where,
      orderBy: {
        ratings: 'desc',
      },
    });

    return tours.map(parseTourJson);
  }

  // Bulk upsert tours
  static async bulkUpsertTours(tours: TourWithParsedJson[]): Promise<void> {
    await prisma.$transaction(
      tours.map((tourData) => {
        const data = stringifyTourJson(tourData);
        const createInput: Prisma.TourCreateInput = {
          tourId: data.tourId,
          title: data.title,
          description: data.description,
          location: data.location as Prisma.InputJsonValue,
          ratings: data.ratings,
          reviews: data.reviews,
          categories: data.categories,
          duration: data.duration,
          priceRange: data.priceRange as Prisma.InputJsonValue,
          schedule: data.schedule 
            ? (data.schedule as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        };

        return prisma.tour.upsert({
          where: { tourId: data.tourId },
          update: {
            ...createInput,
            updatedAt: new Date(),
          },
          create: createInput,
        });
      })
    );
  }
}