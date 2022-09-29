import { useEffect, useRef, useState } from "react";
import "./Popup.scss";
import { Script } from "./Script";
import { SCRIPTS } from "./scripts";

const SEACH_KEYS = [
  (s) => s.title,
  (s) => s.id,
  (s) => s.directives.description || "",
];

const normalize = (str, condensed = false) =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(condensed ? /[^a-z0-9]/g : /[\u0300-\u036f]/g, "");

export const Popup = () => {
  const defaultQuery = localStorage.getItem("query") || "";

  const inputRef = useRef(null);
  const [query, setQueryOnly] = useState(defaultQuery);

  // Disgusting hack to make the root take its actual width
  const rootRef = useRef(null);
  useEffect(() => {
    rootRef.current.setAttribute("style", "width:0px");
    setTimeout(() => rootRef.current.removeAttribute("style"));
  }, []);

  const getFilteredScripts = (query) =>
    SCRIPTS.filter(
      (s) =>
        !query ||
        SEACH_KEYS.some((getKey) => normalize(getKey(s)).includes(query))
    );
  const scripts = getFilteredScripts(query);

  const [selected, setSelected] = useState(
    scripts.length === 1 ? scripts[0].id : null
  );

  const setQuery = (rawQuery) => {
    const newQuery = normalize(rawQuery);
    setQueryOnly(newQuery);
    localStorage.setItem("query", newQuery);
    const nextScripts = getFilteredScripts(newQuery);
    if (nextScripts.length === 1) {
      setSelected(nextScripts[0].id);
    }
  };

  const onKeydown = (ev) => {
    if (!scripts.length) {
      return;
    }
    const scriptEls = [...rootRef.current.querySelectorAll(".Script")];
    const { activeElement } = document;
    const activeScript = activeElement.closest(".Script");
    const index = scriptEls.indexOf(activeScript);
    const key = ev.key.toLowerCase();
    switch (key) {
      case "arrowup": {
        ev.preventDefault();
        scriptEls.at(Math.max(index - 1, -1)).focus();
        break;
      }
      case "arrowdown": {
        ev.preventDefault();
        scriptEls.at((index + 1) % scriptEls.length).focus();
        break;
      }
      case "alt":
      case "control":
      case "enter":
      case "shift":
      case "tab": {
        return;
      }
      default: {
        inputRef.current.focus();
        break;
      }
    }
  };

  return (
    <main
      ref={rootRef}
      className="Popup container-lg d-flex flex-column m-0 bg-dark text-light"
      onKeyDown={onKeydown}
    >
      <div className="input-group my-3">
        <input
          ref={inputRef}
          className="form-control bg-dark text-light"
          type="search"
          name="search"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="Search script..."
          autoFocus
        />
      </div>
      <ul className="scripts overflow-auto mb-3 pe-2 h-100 list-group">
        {scripts.map((script) => (
          <Script
            key={script.id}
            script={script}
            selected={selected === script.id}
            onClick={(ev) => {
              if (script.id !== selected) {
                const target = ev.currentTarget;
                setTimeout(() => target.scrollIntoView({ block: "center" }));
              }
              setSelected(script.id);
            }}
          />
        ))}
        {!scripts.length && (
          <div className="list-group-item bg-dark text-muted fst-italic">
            No result for "{query}"
          </div>
        )}
      </ul>
    </main>
  );
};
