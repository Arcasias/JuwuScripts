/**
 * Netflix & Do nothing
 *
 * @description Automatically click on the `Skip Intro` and `Next Episode` buttons as soon as they appear.
 * @website https://www.netflix.com/
 * @wrapper observer
 */

[
  ...document.querySelectorAll(
    ".watch-video--skip-content-button,[data-uia=next-episode-seamless-button]"
  ),
].forEach((e) => e.click());
