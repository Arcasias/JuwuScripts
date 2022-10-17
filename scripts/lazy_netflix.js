/**
 * Netflix & Do nothing
 *
 * Automatically clicks on the **Skip Intro** and **Next Episode** buttons as soon
 * as they appear. Sit back and relax!
 *
 * @run disabled
 * @website https://www.netflix.com/
 * @wrapper observer
 */

[
  ...document.querySelectorAll(
    ".watch-video--skip-content-button,[data-uia=next-episode-seamless-button]"
  ),
].forEach((e) => e.click());
