/**
 * Shana Project 1080p
 *
 * @description Filter the search results to only have 1080p links.
 * @website https://www.shanaproject.com/
 * @use after searching for any anime
 */

[...document.getElementsByClassName("release_block")].map(
  (x) => !/1080p/.test(x.innerText) && x.remove()
).length;
