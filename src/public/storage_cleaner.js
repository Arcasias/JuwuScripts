/**
 * Storage cleaner
 *
 * @description Clean local and session storages and prevent them from being used.
 */

Storage.prototype.setItem = (key) => {
  console.debug(`Storage: prevented "${key}" from being added.`);
};
for (const storage of [window.localStorage, window.sessionStorage]) {
  storage.clear();
}
