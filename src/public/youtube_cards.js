/**
 * Remove YouTube suggestion cards
 *
 * @description Removes the suggestion cards at the end of a video.
 * @website https://www.youtube.com/
 * @wrapper observer
 */

[...document.querySelectorAll(".ytp-ce-element")].map((element) =>
  element.remove()
);
