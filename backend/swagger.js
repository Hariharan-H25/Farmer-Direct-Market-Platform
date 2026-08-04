import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FarmConnect API Documentation',
      version: '5.0.0',
      description: 'Comprehensive REST API documentation for FarmConnect - Direct Farmer-to-Buyer Marketplace Platform.',
      contact: {
        name: 'FarmConnect Support',
        email: 'support@farmconnect.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
      {
        url: 'https://farmconnect-api.onrender.com/api',
        description: 'Production Server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['buyer', 'farmer', 'admin'] },
            location: { type: 'string' },
            phone: { type: 'string' },
            isVerifiedFarmer: { type: 'boolean' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            unit: { type: 'string' },
            stock: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            location: { type: 'string' },
            rating: { type: 'number' },
            farmer: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            customer: { type: 'string' },
            items: { type: 'array' },
            totalAmount: { type: 'number' },
            deliveryStatus: { type: 'string' },
            shippingAddress: { type: 'object' },
            paymentMethod: { type: 'string' },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'OK' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            database: { type: 'string', example: 'connected' },
            memory: { type: 'object' },
            version: { type: 'string', example: '5.0.0' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'FarmConnect API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // JSON format spec endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
