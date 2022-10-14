/**
 * Mouse position
 *
 * @description Displays the mouse position in real time in the dev tools
 * @use in a new Google Chrome `Live Expression` block
 * @wrapper none
 * @run clipboard
 * @icon bi-mouse-fill
 */

onmousemove
  ? mouse
  : (window.mouse = []) &&
    (window.onmousemove = (ev) => (window.mouse = [ev.clientX, ev.clientY]));
