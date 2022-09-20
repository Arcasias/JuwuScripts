/**
 * Spongebobify
 *
 * @description Time to sPonGeBobIfY your texts!
 * @result spongebobify
 */

window.spongebobify = (text) =>
  text
    .split("")
    .map((c) => (Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
