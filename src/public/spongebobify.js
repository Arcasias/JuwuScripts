/**
 * Spongebobify
 *
 * @description Time to sPonGeBobIfY your texts!
 * @result spongebobify
 */

window.spongebobify = (text) => {
  const result = text
    .split("")
    .map((c) => (Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
  navigator.clipboard.writeText(result).catch(console.debug);
  return result;
};
