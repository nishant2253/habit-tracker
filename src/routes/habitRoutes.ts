import { Router } from 'express';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  trackHabit,
  getHabitHistory,
} from '../controllers/habitController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/track', trackHabit);
router.get('/:id/history', getHabitHistory);

export default router;
