/**
 * Storage cleaner
 *
 * @description Clean local and session storages and prevent them from being used.
 */

Storage.prototype.setItem = (key, value) => {
  console.debug(
    `Storage: prevented 'setItem' with arguments key="${key}" and value="${value}".`
  );
};
for (const storage of [window.localStorage, window.sessionStorage]) {
  storage.clear();
}
