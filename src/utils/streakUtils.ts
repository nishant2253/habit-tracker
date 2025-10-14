import dayjs from 'dayjs';

export const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) {
    return 0;
  }

  const sortedDates = dates.map(date => dayjs(date)).sort((a, b) => b.diff(a));

  let currentStreak = 1;
  let lastDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    if (lastDate.diff(currentDate, 'day') === 1) {
      currentStreak++;
      lastDate = currentDate;
    } else if (lastDate.diff(currentDate, 'day') > 1) {
      break;
    }
  }

  return currentStreak;
};
