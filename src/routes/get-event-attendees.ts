import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../libs/db/prisma';

export const getEventAttendees = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/events/:eventId/attendees',
    {
      schema: {
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          page: z.string().nullable().default('0').transform(Number),
          name: z.string().nullable(),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email(),
                checkedInAt: z.date().nullable(),
                createdAt: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;
      const { page, name } = req.query;

      const attendees = await prisma.attendee.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true,
            },
          },
        },
        where: name
          ? {
              eventId,
              name: {
                contains: name,
              },
            }
          : {
              eventId,
            },
        take: 10,
        skip: page * 10,
      });

      res.send({
        attendees: attendees.map(({ id, name, email, createdAt, checkIn }) => {
          return {
            id,
            name,
            email,
            createdAt,
            checkedInAt: checkIn?.createdAt ?? null,
          };
        }),
      });
    }
  );
};
