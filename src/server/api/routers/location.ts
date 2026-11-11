import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const locationRouter = createTRPCRouter({
  // Fetch all saved locations
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.location.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  // Create a new location pin
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.location.create({
        data: {
          title: input.title,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });
    }),
});