import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { enforceSettings } from './middleware/settingsEnforcement';
import { enforceSessionTimeout } from './middleware/sessionTimeout';
import path from 'path';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Relaxed for development testing
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors({
  origin: true, // Allow all origins for dev network access
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(enforceSettings);
app.use(enforceSessionTimeout);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on all interfaces at port ${port}`);
});
