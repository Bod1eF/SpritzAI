// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as scrapeRoutes from './routes/scrapeRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Load YAML Swagger document
// const swaggerDocument = YAML.load('./swagger.yaml');

// // Swagger UI setup
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.post('/api/scrape', scrapeRoutes.findDupes);

// 404 handler
app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

export default app;
