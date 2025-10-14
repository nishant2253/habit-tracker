import { Response } from 'express';
import Habit from '../models/Habit';
import TrackLog from '../models/TrackLog';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateStreak } from '../utils/streakUtils';
import dayjs from 'dayjs';

export const createHabit = async (req: AuthRequest, res: Response) => {
  const { title, description, frequency, tags, reminderTime } = req.body;

  try {
    const habit = new Habit({
      user: req.user?.id,
      title,
      description,
      frequency,
      tags,
      reminderTime,
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabits = async (req: AuthRequest, res: Response) => {
  const { tag, page = 1, limit = 10 } = req.query;

  try {
    const query: any = { user: req.user?.id };

    if (tag) {
      query.tags = tag;
    }

    const habits = await Habit.find(query)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const count = await Habit.countDocuments(query);

    res.json({
      habits,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitById = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user?.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user?.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await TrackLog.deleteMany({ habit: req.params.id });

    res.json({ message: 'Habit deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const trackHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = dayjs().startOf('day');
    const existingLog = await TrackLog.findOne({
      habit: req.params.id,
      date: {
        $gte: today.toDate(),
        $lt: today.endOf('day').toDate(),
      },
    });

    if (existingLog) {
      return res.status(400).json({ message: 'Habit already tracked today' });
    }

    const newLog = new TrackLog({
      habit: req.params.id,
      date: new Date(),
    });

    await newLog.save();

    const logs = await TrackLog.find({ habit: req.params.id }).sort({ date: -1 });
    const dates = logs.map(log => log.date);

    const currentStreak = calculateStreak(dates);
    habit.currentStreak = currentStreak;

    if (currentStreak > habit.longestStreak) {
      habit.longestStreak = currentStreak;
    }

    await habit.save();

    res.status(201).json(habit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitHistory = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await TrackLog.find({ habit: req.params.id })
      .sort({ date: -1 })
      .limit(7);

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
