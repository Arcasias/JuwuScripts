import { useEffect, useRef } from "react";
import { useState } from "react";
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

  const [query, setQueryOnly] = useState(defaultQuery);

  // Disgusting hack to make the root take its actual width
  const ref = useRef(null);
  useEffect(() => {
    ref.current.setAttribute("style", "width:0px");
    setTimeout(() => ref.current.removeAttribute("style"));
  }, []);

  const scripts = query
    ? SCRIPTS.filter((s) =>
        SEACH_KEYS.some((getKey) => normalize(getKey(s)).includes(query))
      )
    : SCRIPTS;

  const [hovered, setHovered] = useState(
    scripts.length === 1 ? scripts[0].id : null
  );

  const setQuery = (newQuery) => {
    setQueryOnly(newQuery);
    localStorage.setItem("query", newQuery);
    if (scripts.length === 1) {
      setHovered(scripts[0].id);
    }
  };

  return (
    <main
      ref={ref}
      className="Popup container-lg d-flex flex-column m-0 bg-dark text-light"
    >
      <div className="input-group my-3">
        <input
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
            hovered={hovered === script.id}
            onHover={() => setHovered(script.id)}
          />
        ))}
        {!scripts.length && (
          <div class="list-group-item bg-dark text-muted fst-italic">
            No result for "{query}"
          </div>
        )}
      </ul>
    </main>
  );
};
