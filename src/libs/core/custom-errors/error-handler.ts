import { FastifyInstance } from 'fastify';
import { BadRequest } from './bad-request';
import { ZodError } from 'zod';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, req, res) => {
  if (error instanceof BadRequest) {
    return res.status(400).send({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).send({
      message: 'Validation Error',
      errors: error.flatten().fieldErrors,
    });
  }

  return res.status(500).send({ message: 'Internal Server Error' });
};
