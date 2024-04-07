import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../libs/db/prisma';
import { BadRequest } from '../libs/core/custom-errors/bad-request';

export const getAttendeeBadge = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId',
    {
      schema: {
        params: z.object({
          attendeeId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string().email(),
              event: z.object({
                title: z.string(),
                checkInURL: z.string().url(),
              }),
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const { attendeeId } = req.params;

      const attendee = await prisma.attendee.findUnique({
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        where: {
          id: attendeeId,
        },
      });

      if (!attendee) {
        throw new BadRequest('Attendee not found.');
      }

      const baseURL = `${req.protocol}://${req.hostname}`;
      const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);

      res.send({
        badge: {
          ...attendee,
          event: {
            title: attendee.event.title,
            checkInURL: checkInURL.toString(),
          },
        },
      });
    }
  );
};
