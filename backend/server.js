import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  requestLogger, 
  responseTimer, 
  errorHandler,
  authRequired 
} from './middleware/index.js';
import { setupAllRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const featuresPath = path.join(__dirname, 'config/features.json');
let FEATURES = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(requestLogger(logger));
app.use(responseTimer);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/config/features', (_req, res) => res.json(FEATURES));

app.use('/api/own-*', authRequired);
app.use('/api/all-users', authRequired);
app.use('/api/snow/incidents', authRequired);
app.use('/api/ops-failures', authRequired);

setupAllRoutes(app, FEATURES, logger);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ msg: `backend listening on http://localhost:${PORT}` });
});