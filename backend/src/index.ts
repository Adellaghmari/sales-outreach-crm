import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import demoRoutes from './demo/router';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isDemoMode = !process.env.DATABASE_URL || process.env.DEMO_MODE === 'true';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'Sales Outreach CRM API',
    status: 'ok',
    version: '1.0.0',
    health: '/api/health',
  });
});

app.use('/api', isDemoMode ? demoRoutes : routes);

app.use(errorHandler);

app.listen(PORT, () => {
  if (isDemoMode) {
    console.log(`Sales Outreach CRM API running on port ${PORT} (DEMO MODE - no database)`);
  } else {
    console.log(`Sales Outreach CRM API running on port ${PORT}`);
  }
});
