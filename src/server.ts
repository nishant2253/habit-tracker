import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

app.use('/api', authRoutes);
app.use('/api/habits', habitRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
