import { Response } from 'express';
import Habit from '../models/Habit';
import TrackLog from '../models/TrackLog';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateSlidingStreak } from '../utils/streakUtils';
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
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;

    const totalHabits = await Habit.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalHabits / limit);

    if (page > totalPages && totalHabits > 0) {
      return res.status(400).json({ message: "Page number out of range" });
    }

    const habits = await Habit.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      habits,
      pagination: { totalHabits, totalPages, currentPage: page, limitPerPage: limit },
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
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const targetDate = req.body.date ? dayjs(req.body.date).startOf("day") : dayjs().startOf("day");

    // Check duplicate
    const existing = await TrackLog.findOne({
      habit: habit._id,
      date: { $gte: targetDate.toDate(), $lt: targetDate.endOf("day").toDate() },
    });

    if (existing) {
      return res.status(400).json({ message: "Habit already tracked for this date" });
    }

    // Create new log
    const newLog = new TrackLog({ habit: habit._id, date: targetDate.toDate() });
    await newLog.save();

    // Recalculate streak
    const logs = await TrackLog.find({ habit: habit._id }).sort({ date: 1 });
    const { current, longest } = calculateSlidingStreak(logs.map(l => l.date));

    habit.currentStreak = current;
    habit.longestStreak = longest;
    await habit.save();

    res.status(201).json({
      message: "Habit tracked successfully",
      date: targetDate.format("YYYY-MM-DD"),
      currentStreak: current,
      longestStreak: longest,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitHistory = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await TrackLog.find({ habit: req.params.id })
      .sort({ date: -1 })
      .limit(7);

    if (logs.length < 7) {
      return res.status(400).json({ message: "Not sufficient history (need 7 or more logs)" });
    }

    res.json({
      totalLogs: logs.length,
      last7Days: logs.map(l => dayjs(l.date).format("YYYY-MM-DD")),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
