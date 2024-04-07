import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../libs/db/prisma';
import { generateSlug } from '../libs/core/utils/generate-slug';

export const createEvent = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events',
    {
      schema: {
        body: z.object({
          title: z.string().min(5),
          details: z.string().max(80).nullish(),
          maxAttendees: z.number().positive().int().nullish(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { title, details, maxAttendees } = req.body;

      const event = await prisma.event.create({
        data: {
          title,
          details,
          maxAttendees,
          slug: generateSlug(title),
        },
      });

      res.status(201).send({ eventId: event.id });
    }
  );
};
