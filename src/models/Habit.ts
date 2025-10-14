import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
  },
  tags: {
    type: [String],
  },
  reminderTime: {
    type: String,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('Habit', HabitSchema);
