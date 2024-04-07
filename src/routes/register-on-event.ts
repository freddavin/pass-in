import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../libs/db/prisma';
import { BadRequest } from '../libs/core/custom-errors/bad-request';

export const registerOnEvent = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events/:eventId/register',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, email } = req.body;
      const { eventId } = req.params;

      const attendeeRegister = await prisma.attendee.findUnique({
        where: {
          email_eventId: {
            email,
            eventId,
          },
        },
      });

      if (attendeeRegister) {
        throw new BadRequest('Attendee has already registered for this event.');
      }

      const event = await prisma.event.findUnique({
        select: {
          maxAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        where: {
          id: eventId,
        },
      });

      if (event?.maxAttendees && event._count.attendees >= event.maxAttendees) {
        throw new BadRequest(
          'This event has reached the maximum number of attendees.'
        );
      }

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      res.status(201).send({ attendeeId: attendee.id });
    }
  );
};
