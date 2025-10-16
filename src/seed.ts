import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/User';
import Habit from './models/Habit';
import TrackLog from './models/TrackLog';

dotenv.config();

const seedDB = async () => {
  await connectDB();

  await User.deleteMany({});
  await Habit.deleteMany({});
  await TrackLog.deleteMany({});

  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  const habit = await Habit.create({
    user: user._id,
    title: 'Read a book',
    description: 'Read 10 pages of a book daily',
    frequency: 'daily',
    tags: ['reading', 'self-improvement'],
  });

  await TrackLog.create({
    habit: habit._id,
    date: new Date(),
  });

  console.log('Database seeded successfully');
  process.exit();
};

seedDB();
