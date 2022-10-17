/**
 * Cross-reload timer
 *
 * This script should be appended where the timer should start, then the timer can
 * be stopped with `timerStop()` and the results of can be printed with `timerLog()`.
 *
 * @icon stopwatch
 * @run disabled
 */

const MAX_ATTEMPTS = 1000;
const TIMER_NAME = "default";
const PREFIX = "timer-";
const start = Date.now();

export const timerStop = () => {
  const time = Date.now() - start;
  const previous = localStorage.getItem(PREFIX + TIMER_NAME);
  const attempts = previous ? previous.split(",").map(Number) : [];
  attempts.push(time);
  localStorage.setItem(PREFIX + TIMER_NAME, attempts.join(","));
  if (attempts.length < MAX_ATTEMPTS) {
    window.top.location.reload();
  }
};

export const timerLog = () => {
  for (const key in localStorage) {
    if (key.startsWith(PREFIX)) {
      const arr = localStorage
        .getItem(key)
        .split(",")
        .map(Number)
        .sort((a, b) => a - b);
      const half = arr.length / 2;
      console.log(
        `Results for "${key.slice(PREFIX.length)}" on`,
        arr.length,
        "attempts:"
      );
      console.log({
        max: Math.max(...arr),
        min: Math.min(...arr),
        mean: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length),
        median: Math.round(
          arr.length % 2
            ? arr[Math.floor(half)]
            : (arr[half - 1] + arr[half]) / 2
        ),
      });
    }
  }
};

export const timerClear = () => {
  for (const key in localStorage) {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key);
    }
  }
};
