import cors from 'cors';
import express from 'express';

import { router } from './routes/index.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api', router);

export { app };
