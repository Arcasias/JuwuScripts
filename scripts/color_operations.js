/**
 * Hexadecimal to RGB and vice-versa
 *
 * Converts **RGB arrays** to **hexadecimal** colors and vice-versa.
 *
 * @icon bi-palette
 */

export const hexToRgb = (hex) =>
  String(hex)
    .match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/)
    ?.slice(1, 4)
    .map((x) => parseInt(x, 16));

export const rgbToHex = (col) =>
  "#" + col.map((x) => Math.floor(x).toString(16).padStart(2, "0")).join("");
