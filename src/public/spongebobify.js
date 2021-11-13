/**
 * Spongebobify
 *
 * @description Time to sPonGeBobIfY your texts!
 * @result spongebobify
 */

const spongebobify = (text) =>
  text
    .split("")
    .map((c, i) => (Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
