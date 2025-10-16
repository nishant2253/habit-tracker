import dayjs from "dayjs";

export const calculateSlidingStreak = (dates: Date[]) => {
  if (!dates.length) return { current: 0, longest: 0 };

  // Sort oldest → newest
  const sorted = dates.map(d => dayjs(d).startOf('day')).sort((a, b) => a.diff(b));

  let current = 1;
  let longest = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].diff(sorted[i - 1], "day");

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1; // streak broken
    }
  }

  // Check if streak continues up to today
  const lastDate = sorted[sorted.length - 1];
  const isContinuous = dayjs().startOf('day').diff(lastDate, "day") <= 1;

  return {
    current: isContinuous ? current : 0,
    longest,
  };
};
