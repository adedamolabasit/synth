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
    servers: [{ url: 'http://localhost:8000/api/v1' }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
