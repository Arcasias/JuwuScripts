/**
 * Cross-reload timer
 *
 * @description This script should be appended where the timer should start, then the timer can be stopped with `timer.stop()` and the results of can be printed with `timer.log()`
 * @result timer
 */

((key, max) => {
  const PREFIX = "timer-";
  const start = Date.now();
  window.timer = {
    stop() {
      const time = Date.now() - start;
      const previous = localStorage.getItem(PREFIX + key);
      const attempts = previous ? previous.split(",").map(Number) : [];
      attempts.push(time);
      localStorage.setItem(PREFIX + key, attempts.join(","));
      if (attempts.length < max) {
        window.top.location.reload();
      }
    },
    log() {
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
    },
    clear() {
      for (const key in localStorage) {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    },
  };
})("timer", 1000);
