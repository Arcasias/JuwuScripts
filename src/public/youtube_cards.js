/**
 * Remove YouTube suggestion cards
 *
 * @description Removes the suggestion cards at the end of a video.
 * @use at the end of a video when the cards appear.
 * @website https://www.youtube.com/
 */
[...document.getElementsByClassName("ytp-ce-element")].map((element) =>
  element.remove()
);
