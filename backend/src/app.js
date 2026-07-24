import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import webhookRoutes from './modules/checkout/webhook.routes.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { env } from './config/env.js';

const app = express();


app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

app.use('/api/checkout/webhook', webhookRoutes);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorMiddleware);

export default app;