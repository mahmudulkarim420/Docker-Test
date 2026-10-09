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
  commit: string;
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
    commit: process.env.COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (_req, res) => {
  let database = 'connected';
  let redisStatus = 'connected';

  try {
    await db.query('SELECT 1');
  } catch (error) {
    console.error('Database readiness check failed:', error);
    database = 'disconnected';
  }

  try {
    const redisPing = await redis.ping();

    if (redisPing !== 'PONG') {
      redisStatus = 'disconnected';
    }
  } catch (error) {
    console.error('Redis readiness check failed:', error);
    redisStatus = 'disconnected';
  }

  const ready = database === 'connected' && redisStatus === 'connected';

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    database,
    redis: redisStatus
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

  const shutdown = async (signal: string) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log('HTTP server closed.');
    }

    await db.end();
    console.log('Database connection pool closed.');

    if (redis.isOpen) {
      await redis.quit();
      console.log('Redis connection closed.');
    }

    console.log('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('Graceful shutdown failed:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
}

export { app, server };
export default app;
