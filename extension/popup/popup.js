import { SCRIPTS } from "./scripts.js";

const SEACH_KEYS = [
  (s) => s.title,
  (s) => s.id,
  (s) => s.directives.description || "",
];

const searchInput = document.getElementById("search-input");
const scriptsList = document.getElementById("scripts-list");
const state = {};

const activateScript = async (scriptId) => {
  if (state.status[scriptId]) {
    return;
  }

  setState({ status: { ...state.status, [scriptId]: "muted" } });

  const script = SCRIPTS.find((s) => s.id === scriptId);
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [`./src/public/${script.fileName}`],
    });
    setState({ status: { ...state.status, [scriptId]: "success" } });
  } catch (err) {
    console.debug(err);
    setState({ status: { ...state.status, [scriptId]: "danger" } });
  }
};

const normalize = (str, condensed = false) =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(condensed ? /[^a-z0-9]/g : /[\u0300-\u036f]/g, "");

const websiteName = (url) => {
  const a = document.createElement("a");
  a.href = url;
  return a.hostname;
};

const setState = (newState, refreshInput = true) => {
  if ("query" in newState) {
    newState.query = normalize(newState.query);
    localStorage.setItem("query", newState.query);
    if (refreshInput) {
      searchInput.value = newState.query;
    }
  }
  const oldState = { ...state };
  Object.assign(state, newState);
  if (JSON.stringify(oldState) === JSON.stringify(state)) {
    return;
  }

  // Renders the list
  const matches = state.query
    ? SCRIPTS.filter((s) =>
        SEACH_KEYS.some((getKey) => normalize(getKey(s)).includes(state.query))
      )
    : SCRIPTS;
  const items = [];
  for (const { id, title, directives } of matches) {
    const { description, use, website } = directives;
    const status = state.status[id];
    items.push(/* html */ `
  <li class="script card bg-dark mt-2 ${
    status ? `border-${status}` : ""
  }" tabindex="0" data-id="${id}">
    <div class="card-body">
      <h5 class="script-title card-title ${status ? `text-${status}` : ""}">
        ${title}
      </h5>
      ${
        description
          ? /* html */ `<p class="script-details card-text">${description}</p>`
          : ""
      }
      <ul class="script-details list-group list-group-flush">
        ${
          website
            ? /* html */ `
            <li class="list-group-item bg-dark text-light">
              Website: <a href="${website}" target="_blank" class="script-details card-link">${websiteName(
                website
              )}</a>
            </li>`
            : ""
        }
        ${
          use
            ? /* html */ `
            <li class="list-group-item bg-dark text-light">
              Use: ${use}
            </li>`
            : ""
        }
      </ul>
      <footer class="card-footer">
        <code>${JSON.stringify(directives)}</code>
      </footer>
    </div>
  </li>`);
  }
  scriptsList.innerHTML = items.join("\n");
};

searchInput.addEventListener("input", (ev) => {
  setState({ query: ev.target.value }, false);
});

searchInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && state.query) {
    ev.preventDefault();
    ev.target.value = "";
    setState({ query: "" });
  }
});

scriptsList.addEventListener("click", (ev) => {
  const script = ev.target.closest(".script");
  if (script) {
    activateScript(script.dataset.id);
  }
});

window.addEventListener("keydown", (ev) => {
  const script = ev.target.closest(".script");
  if (script && ev.key === "Enter") {
    return activateScript(script.dataset.id);
  }
  if (["Tab", "Escape", "Control", "Alt", "Enter"].includes(ev.key)) {
    return;
  }
  searchInput.focus();
});

const defaultQuery = localStorage.getItem("query");
setState({ status: {}, query: defaultQuery || "" });

// Disgusting hack to display the actual body width
document.body.setAttribute("style", "width:100%");
setTimeout(() => document.body.removeAttribute("style"));
