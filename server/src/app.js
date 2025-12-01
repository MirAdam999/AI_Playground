import express from 'express';
import cors from "cors";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import chatRoutes from './routes/chatRoutes.js';
import userStateRoutes from './routes/userStateRoutes.js';

import { Limits } from './utils/limits.js';

const limiter = rateLimit({
    windowMs: 1000,
    max: Limits.secsBetweenRequests,
});

const app = express();

app.use(helmet());
app.use(limiter);
app.use(cors({
    origin: 'http://localhost:3001'
}));
app.use(express.json());

app.use('/chat', chatRoutes);
app.use('/user', userStateRoutes);

export default app;
