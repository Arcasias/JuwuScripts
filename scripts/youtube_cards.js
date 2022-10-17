/**
 * Remove YouTube suggestion cards
 *
 * Removes the suggestion cards at the end of videos.
 *
 * @website https://www.youtube.com/
 * @wrapper observer
 */

[...document.querySelectorAll(".ytp-ce-element")].map((element) =>
  element.remove()
);
