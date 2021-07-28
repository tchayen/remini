const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

const format = (ms: number, abbreviation: string, unit: number) => {
  const amount = Math.floor(ms / unit);

  return `${amount}${abbreviation}`;
};

export const getFriendlyTime = (date: Date): string => {
  const ms = Date.now() - date.getTime();
  if (isNaN(ms) || !isFinite(ms)) {
    throw new Error(`Wrong value provided: ${ms}`);
  }

  if (ms < SECOND) {
    return "second ago";
  } else if (ms < MINUTE) {
    const amount = Math.floor(ms / SECOND);
    if (amount < 2) {
      return `second ago`;
    }
    return `few seconds ago`;
  } else if (ms < HOUR) {
    return format(ms, "m", MINUTE);
  } else if (ms < DAY) {
    return format(ms, "h", HOUR);
  } else if (ms < MONTH) {
    return format(ms, "d", DAY);
  } else if (ms < YEAR) {
    return format(ms, "m", MONTH);
  } else {
    return format(ms, "y", YEAR);
  }
};
