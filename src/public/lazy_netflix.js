/**
 * Netflix & Do nothing
 *
 * @description Automatically click on the `Skip Intro` and `Next Episode` buttons as soon as they appear.
 * @use after launching any video.
 * @website https://www.netflix.com/
 */

new MutationObserver(() =>
  [
    ...document.querySelectorAll(
      ".watch-video--skip-content-button,[data-uia=next-episode-seamless-button]"
    ),
  ].map((e) => e.click())
).observe(document.body, { childList: !0, subtree: !0 });
