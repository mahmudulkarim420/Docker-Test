import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'http';

const app = express();

app.use(cors());
app.use(express.json());

export interface ApiResponse {
  message: string;
  status: string;
  code: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

app.get('/', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    message: 'hello from Docker CI/CD',
    status: 'running',
    code: 200
  });
});

app.get('/health', (req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

let server: Server | undefined;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export { app, server };
export default app;
