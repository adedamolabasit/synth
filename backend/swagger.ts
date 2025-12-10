import swaggerJSDoc = require('swagger-jsdoc');
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lyrics API',
      version: '1.0.0',
      description: 'API for extracting lyrics from audio files',
    },
    servers: [{ url: 'https://synth-production-c068.up.railway.app/api/docs' }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
