/**
 * Shana Project 1080p
 *
 * Filters the search results to only have 1080p links.
 *
 * @website https://www.shanaproject.com/
 * @wrapper observer
 */

[...document.getElementsByClassName("release_block")].forEach(
  (x) => !/1080p/.test(x.innerText) && x.remove()
);
