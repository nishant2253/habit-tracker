import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

app.use('/api', authRoutes);
app.get('/api', (req, res) => res.send('API is running...'));
app.use('/api/habits', habitRoutes);

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;