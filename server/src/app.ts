import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './generated/routes';
import swaggerDocument from './generated/swagger.json';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

RegisterRoutes(app);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidateError) {
    return res.status(422).json({ message: 'Validation Failed', details: err.fields });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  next();
});

export default app;
