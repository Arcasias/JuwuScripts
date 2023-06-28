/**
 * Better console
 *
 * Easy to use console formats!
 */

const isCalledAsTemplateTag = ([arg0, ...interpValues]) =>
  Array.isArray(arg0) &&
  Object.isFrozen(arg0) &&
  arg0.length &&
  arg0.raw &&
  arg0.raw.length === arg0.length &&
  interpValues.length + 1 === arg0.length;

const patchMethod = (method) => {
  const originalMethod = console[method];
  console[method] = {
    [method](...args) {
      const processedArgs = [];
      const styles = [];

      // Flatten arguments
      if (isCalledAsTemplateTag(args)) {
        const [strings, ...values] = args;
        for (let i = 0; i < strings.length; i++) {
          processedArgs.push(strings[i].trim(), i in values ? values[i] : "");
        }
      } else {
        processedArgs.push(...args);
      }

      // Combine strings
      const finalArgs = [];
      for (const arg of processedArgs) {
        if (
          finalArgs.length &&
          typeof arg === "string" &&
          typeof finalArgs.at(-1) === "string"
        ) {
          const lastStringArg = finalArgs.pop();
          finalArgs.push(`${lastStringArg} ${arg}`);
        } else {
          finalArgs.push(arg);
        }
      }

      // Extract styles
      if (typeof finalArgs[0] === "string" && STYLE_REGEX.test(finalArgs[0])) {
        finalArgs[0] = finalArgs[0].replace(
          STYLE_REGEX,
          (fullString, attrString) => {
            if (attrString.startsWith("\\")) {
              return fullString.replace(attrString, attrString.slice(1));
            }
            const attributes = [];
            for (const pair of attrString.split(ATTRIBUTE_SEPARATOR_REGEX)) {
              const [key, value] = pair.split(KEY_VALUE_SEPARATOR_REGEX);
              attributes.push(
                typeof value === "string"
                  ? `${key}:${value}`
                  : `${"color"}:${key}`
              );
            }
            if (attributes.length) {
              styles.push(attributes.join(";"));
            }
            return "%c";
          }
        );
      }

      // Insert styles
      finalArgs.splice(1, 0, ...styles);

      return originalMethod(...finalArgs);
    },
  }[method];

  return function unpatch() {
    console[method] = originalMethod;
  };
};

const ATTRIBUTE_SEPARATOR_REGEX = /\s*;\s*/g;
const KEY_VALUE_SEPARATOR_REGEX = /\s*:\s*/g;
const STYLE_REGEX = /<@([^>]+)>/g;

if (typeof console.unpatch === "function") {
  console.unpatch();
}
console.unpatch = function unpatch() {
  while (cleanups.length) {
    cleanups.pop()();
  }
};

const cleanups = [
  "debug",
  "error",
  "info",
  "log",
  "warn",
  "dirxml",
  "table",
  "trace",
  "group",
  "groupcollapsed",
].map(patchMethod);

console.log(
  "<@color:#00df00;font-family:Arial;margin-bottom:3px>BETTER CONSOLE ACTIVE\n<@font-family:Arial>Try it out! <@color:orange>console.log`<@\\red>Hello ${'world'}`;"
);
