/**
 * Mouse position
 *
 * Displays the mouse position in real time in the dev tools. This script is designed
 * to run in a Google Chrome `Live Expression` block.
 *
 * @icon mouse
 * @run clipboard
 * @wrapper none
 */

onmousemove
  ? mouse
  : (window.mouse = []) &&
    (window.onmousemove = (ev) => (window.mouse = [ev.clientX, ev.clientY]));
