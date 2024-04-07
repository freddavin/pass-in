import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../libs/db/prisma';
import { BadRequest } from '../libs/core/custom-errors/bad-request';

export const checkIn = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId/check-in',
    {
      schema: {
        params: z.object({
          attendeeId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            checkInId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { attendeeId } = req.params;

      const attendee = await prisma.checkIn.findUnique({
        where: {
          attendeeId,
        },
      });

      if (attendee) {
        throw new BadRequest('Attendee has already checked in.');
      }

      const checkIn = await prisma.checkIn.create({
        data: {
          attendeeId,
        },
      });

      res.status(201).send({ checkInId: checkIn.id });
    }
  );
};
