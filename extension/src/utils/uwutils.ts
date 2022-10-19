import { caseReplacer, Replacer } from "./utils";

export const uwuify = (text: string) =>
  UWU_REPLACERS.reduce(
    (current, [regex, replacer]) =>
      (current = current.replace(regex, replacer as Replacer)),
    text
  );

const UWU_DOT_REPLACERS: Record<string, string> = {
  ".": "UwU",
  "?": "OwO",
  "!": ">w<",
};
const UWU_INSERT_W = "$1w$2";
const UWU_REPLACERS: [RegExp, string | Replacer][] = [
  [/\b(t|d)o\b/gi, "$1uwu"],
  [/\bgo\b/gi, caseReplacer("gow")],
  [/\byou\b/gi, caseReplacer("uwu")],
  [/\bwindow\b/gi, caseReplacer("windowo")],
  [/\b(ca)(n)\b/gi, UWU_INSERT_W],
  [/\b(no)(t)\b/gi, UWU_INSERT_W],
  [/\b(tha)(t)\b/gi, UWU_INSERT_W],
  [/\b(thi)(s)\b/gi, UWU_INSERT_W],
  [/\b(the)(m)\b/gi, UWU_INSERT_W],
  [/[rl]/gi, caseReplacer("w")],
  [/(o)(o)/gi, UWU_INSERT_W],
  [
    /(\s*)([.!?])(\w?)/g,
    (full, space, dot, after) =>
      after ? full : (space || " ") + UWU_DOT_REPLACERS[dot],
  ],
];
