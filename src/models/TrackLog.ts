import mongoose from 'mongoose';

const TrackLogSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

TrackLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.model('TrackLog', TrackLogSchema);
