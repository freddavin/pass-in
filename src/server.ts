import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import {
  checkIn,
  createEvent,
  getAttendeeBadge,
  getEvent,
  getEventAttendees,
  registerOnEvent,
} from './routes';
import { errorHandler } from './libs/core/custom-errors';

const app = fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);
app.register(getEvent);
app.register(registerOnEvent);
app.register(getAttendeeBadge);
app.register(getEventAttendees);
app.register(checkIn);

app.setErrorHandler(errorHandler);

const port = 3000;
app.listen({ port }).then(() => {
  console.log(`Server running on port ${port}`);
});
