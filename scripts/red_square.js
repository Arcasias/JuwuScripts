/**
 * Red square
 *
 * Spawns a big draggable red square.
 *
 * @autorun disabled
 */

const onMousemove = ({ clientX, clientY }) => {
  square.style.left = `${window.scrollX + clientX - dragOffset.x}px`;
  square.style.top = `${window.scrollY + clientY - dragOffset.y}px`;
};

const detachEventListeners = () => {
  square.style.cursor = "grab";
  window.removeEventListener("mousemove", onMousemove);
  window.removeEventListener("mouseup", detachEventListeners);
  window.removeEventListener("keydown", detachEventListeners);
  window.removeEventListener("wheel", detachEventListeners);
};

const dragOffset = { x: 0, y: 0 };
const EDGE_STEP = 8;

const square = document.createElement("div");
const style = {
  "box-shadow": "inset 0 0 0 5px red",
  position: "absolute",
  cursor: "grab",
  left: `${window.scrollX + window.innerWidth / 2 - (8 * EDGE_STEP) / 2}px`,
  top: `${window.scrollY + window.innerHeight / 2 - (8 * EDGE_STEP) / 2}px`,
  width: `${8 * EDGE_STEP}px`,
  height: `${8 * EDGE_STEP}px`,
  "z-index": 9999,
  "background-color": "transparent",
};

square.setAttribute(
  "style",
  Object.entries(style)
    .map(([k, v]) => `${k}:${v};`)
    .join("")
);

square.addEventListener("mousedown", ({ button, clientX, clientY }) => {
  if (button === 1) {
    // Middle click
    square.remove();
  }
  if (button !== 0) {
    // Left click
    return;
  }
  square.style.cursor = "grabbing";
  const squareRect = square.getBoundingClientRect();
  dragOffset.x = clientX - squareRect.x;
  dragOffset.y = clientY - squareRect.y;
  window.addEventListener("mousemove", onMousemove);
  window.addEventListener("mouseup", detachEventListeners);
  window.addEventListener("keydown", detachEventListeners);
  window.addEventListener("wheel", detachEventListeners);
});

square.addEventListener("wheel", (ev) => {
  ev.preventDefault();
  const rect = square.getBoundingClientRect();
  if (ev.deltaY > 0) {
    if (rect.width <= EDGE_STEP || rect.height <= EDGE_STEP) {
      return;
    }
    square.style.width = `${rect.width - EDGE_STEP}px`;
    square.style.height = `${rect.height - EDGE_STEP}px`;
    square.style.left = `${window.scrollX + rect.x + EDGE_STEP / 2}px`;
    square.style.top = `${window.scrollY + rect.y + EDGE_STEP / 2}px`;
  } else {
    square.style.width = `${rect.width + EDGE_STEP}px`;
    square.style.height = `${rect.height + EDGE_STEP}px`;
    square.style.left = `${window.scrollX + rect.x - EDGE_STEP / 2}px`;
    square.style.top = `${window.scrollY + rect.y - EDGE_STEP / 2}px`;
  }
});

document.body.appendChild(square);
