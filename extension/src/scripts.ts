export interface Directives {
  autorun: boolean;
  description?: string;
  icon?: string;
  ignore?: boolean;
  use?: string;
  requires?: string;
  run: "clipboard" | boolean;
  website?: string;
  wrapper: "iife" | "observer" | false;
}

export interface ScriptInfo {
  content?: string;
  directives: Directives;
  exports: Exports;
  ext: string;
  fileName: string;
  id: string;
  path: string[];
  title: string;
}

export type Exports = Record<string, "function" | "object">;

export const scripts: ScriptInfo[] = [
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Adds options to the Odoo backend login screen to login as admin, user or portal in a single click.`,"use":`on any Odoo environment.`,"requires":`odoo`},"ext":`js`,"exports":{},"fileName":`odoo_login.js`,"id":`odoo-login`,"title":`Auto login`,"path":[`src`,`Odoo Buddy`]},
  {"directives":{"autorun":true,"run":false,"wrapper":`iife`,"description":`This script should be appended where the timer should start, then the timer can be stopped with \`timerStop()\` and the results of can be printed with \`timerLog()\``},"ext":`js`,"exports":{"timerStop":`function`,"timerLog":`function`,"timerClear":`function`},"fileName":`timer.js`,"id":`timer`,"title":`Cross-reload timer`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Forces dark mode on odoo.`,"use":`on an Odoo16+ environment`,"requires":`odoo`},"ext":`js`,"exports":{},"fileName":`odoo_dark_mode.js`,"id":`odoo-dark-mode`,"title":`Dark mode`,"path":[`src`,`Odoo Buddy`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Logs several informations about the current Odoo environment, and adds \`odoo.session\` and \`owl.root\` variables.`,"use":`on any Odoo environment.`,"requires":`odoo`},"ext":`js`,"exports":{},"fileName":`odoo_env.js`,"id":`odoo-env`,"title":`Environment`,"path":[`src`,`Odoo Buddy`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Scan the \`window\` object for any additionnal global key.`},"ext":`js`,"exports":{"scanGlob":`function`},"fileName":`glob_scanner.js`,"id":`glob-scanner`,"title":`Global scanner`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Convert **RGB arrays** to **hexadecimal** colors and vice-versa.`},"ext":`js`,"exports":{"hexToRgb":`function`,"rgbToHex":`function`},"fileName":`color_operations.js`,"id":`color-operations`,"title":`Hexadecimal to RGB and vice-versa`,"path":[`src`]},
  {"directives":{"autorun":true,"run":`clipboard`,"wrapper":false,"description":`Displays the mouse position in real time in the dev tools`,"use":`in a new Google Chrome \`Live Expression\` block`,"icon":`bi-mouse-fill`},"ext":`js`,"exports":{},"fileName":`mouse.js`,"id":`mouse`,"content":`onmousemove?mouse:(window.mouse=[],window.onmousemove=o=>window.mouse=[o.clientX,o.clientY]);`,"title":`Mouse position`,"path":[`src`]},
  {"directives":{"autorun":true,"run":false,"wrapper":`observer`,"description":`Automatically click on the \`Skip Intro\` and \`Next Episode\` buttons as soon as they appear.`,"website":`https://www.netflix.com/`},"ext":`js`,"exports":{},"fileName":`lazy_netflix.js`,"id":`lazy-netflix`,"title":`Netflix & Do nothing`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Makes the interactive elements go *crazy*!`},"ext":`js`,"exports":{},"fileName":`runaway.js`,"id":`runaway`,"title":`Run away`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`observer`,"description":`Removes the suggestion cards at the end of a video.`,"website":`https://www.youtube.com/`},"ext":`js`,"exports":{},"fileName":`youtube_cards.js`,"id":`youtube-cards`,"title":`Remove YouTube suggestion cards`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Time to **sPonGeBobIfY** your texts!`},"ext":`js`,"exports":{"spongebobify":`function`},"fileName":`spongebobify.js`,"id":`spongebobify`,"title":`Spongebobify`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`observer`,"description":`Filter the search results to only have 1080p links.`,"website":`https://www.shanaproject.com/`},"ext":`js`,"exports":{},"fileName":`shana.js`,"id":`shana`,"title":`Shana Project 1080p`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Get the size and content of the local/session storages.`},"ext":`js`,"exports":{},"fileName":`storage_analyzer.js`,"id":`storage-analyzer`,"title":`Storage analyzer`,"path":[`src`]},
  {"directives":{"autorun":true,"run":true,"wrapper":`iife`,"description":`Cleans local and session storages and prevents them from being used.`},"ext":`js`,"exports":{},"fileName":`storage_cleaner.js`,"id":`storage-cleaner`,"title":`Storage cleaner`,"path":[`src`]}
];
