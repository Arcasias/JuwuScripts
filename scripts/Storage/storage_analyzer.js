/**
 * Storage analyzer
 *
 * Gets the size and content of the `localStorage` and `sessionStorage`.
 */

const FONT_FAMILY = "Arial";

const toHex = (x) =>
  Math.floor(x * 255)
    .toString(16)
    .padStart(2, "0");

const toHuman = (bytes, styled = true) => {
  let unit = "";
  let byteString = "";
  const s = styled ? "%c" : "";
  if (bytes > 1e9) {
    byteString = (bytes / 2 ** 30).toFixed(2);
    unit = "G";
  } else if (bytes > 1e6) {
    byteString = (bytes / 2 ** 20).toFixed(2);
    unit = "M";
  } else if (bytes > 1e3) {
    byteString = (bytes / 2 ** 10).toFixed(2);
    unit = "K";
  } else {
    byteString = bytes;
  }
  return `${s}${byteString}${s} ${unit}B`;
};

const getWindowPropertyDescriptor = (key) => {
  const iframe = document.createElement("iframe");
  document.head.append(iframe);
  const pd = Object.getOwnPropertyDescriptor(iframe.contentWindow, key);
  iframe.remove();
  return pd;
};

const colorFromvalue = (value, max) => {
  const slice = max / 2;
  const r = Math.min(value / slice, 1);
  const g = 1 - Math.min(Math.max(value - slice, 0) / slice, 1);
  return `#${[r, g, 0].map(toHex).join("")}`;
};

const STORAGES = ["localStorage", "sessionStorage"];
for (const storageType of STORAGES) {
  if (!window[storageType]) {
    Object.defineProperty(
      window,
      storageType,
      getWindowPropertyDescriptor(storageType)
    );
  }
  let totalKeySize = 0;
  let totalValueSize = 0;
  const entries = Object.entries(window[storageType]);
  const details = entries
    .map(([key, value]) => {
      const kSize = new TextEncoder().encode(key).length;
      const vSize = new TextEncoder().encode(value).length;
      totalKeySize += kSize;
      totalValueSize += vSize;
      return [key, kSize + vSize];
    })
    .sort((a, b) => b[1] - a[1])
    .reduce(
      (acc, x) => Object.assign(acc, { [x[0]]: `${toHuman(x[1], false)}` }),
      {}
    );
  const total = totalKeySize + totalValueSize;
  const color = colorFromvalue(total, 5120000);

  const base = `font-family:${FONT_FAMILY};color:inherit;`;
  const highlight = `font-family:${FONT_FAMILY};color:${color};`;

  console.log(
    [
      `%cwindow.${storageType}%c :`,
      `%c- Size: ${toHuman(total)} (keys: ${toHuman(
        totalKeySize
      )} / values: ${toHuman(totalValueSize)})`,
      `%c- Keys: %c${entries.length}%c`,
    ].join("\n"),
    // -- Title colors --
    `font-family:Consolas;color:#d020f0;`,
    base,
    // -- Size colors --
    base,
    highlight,
    base,
    highlight,
    base,
    highlight,
    base,
    // -- Keys colors --
    base,
    highlight,
    base,
    // -- Keys details --
    details
  );
}
