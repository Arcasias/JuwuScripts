/**
 * Hexadecimal to RGB and vice-versa
 *
 * @description Convert RGB arrays to hexadecimal colors and vice-versa.
 * @result hexToRgb & rgbToHex
 */

const hexToRgb = (hex) =>
  String(hex)
    .match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/)
    ?.slice(1, 4)
    .map((x) => parseInt(x, 16));

const rgbToHex = (col) =>
  "#" + col.map((x) => Math.floor(x).toString(16).padStart(2, "0")).join("");
