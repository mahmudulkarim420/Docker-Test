import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { db } from './lib/db.js';
import { redis } from './lib/redis.js';


const app = express();
const APP_NAME = process.env.APP_NAME || "Docker Demo";
app.use(cors());
app.use(express.json());

export interface ApiResponse {
  message: string;
  status: string;
  code: number;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  timestamp: string;
}

app.get('/', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    message: 'Hello we are learning Docker & CI/CD Pipeline V2',
    status: 'running',
    code: 200
  });
});

app.get('/health', (req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'Ok',
    app: APP_NAME,
    version: "v2.0.0",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

let server: Server | undefined;

if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await db.query('SELECT 1');

      await redis.connect();

      server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

export { app, server };
export default app;
