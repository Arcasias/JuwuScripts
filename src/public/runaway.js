/**
 * Run away
 *
 * @description Makes the interactive elements go crazy!
 */

let running = false;
const onMousemove = ({ clientX, clientY }) => {
  for (const el of document.querySelectorAll(
    `a[href],button,input,select,[tabindex]:not([tabindex="-1"]`
  )) {
    const { x, y, height, width } = el.getBoundingClientRect();
    if (!width || !height) {
      continue;
    }
    const dx = x + width / 2 - clientX;
    const dy = y + height / 2 - clientY;
    const dist = Math.sqrt(dx ** 2 + dy ** 2);
    if (dist < Math.max(100, width + 20, height + 20)) {
      Object.assign(el.style, {
        position: "fixed",
        width: `${width}px`,
        height: `${height}px`,
        left: `${x + dx}px`,
        top: `${y + dy}px`,
      });
    }
  }
};
window.addEventListener(
  "mousemove",
  async (ev) => {
    if (running) {
      return;
    }
    running = true;
    onMousemove(ev);
    await new Promise(requestAnimationFrame);
    running = false;
  },
  true
);
