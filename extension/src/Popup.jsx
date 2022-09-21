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
    <main className="Popup container-lg d-flex flex-column m-0 bg-dark text-light">
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
      <ul className="scripts overflow-auto pe-2 h-100 list-unstyled">
        {scripts.map((script) => (
          <Script
            key={script.id}
            script={script}
            hovered={hovered === script.id}
            onHover={() => setHovered(script.id)}
          />
        ))}
      </ul>
    </main>
  );
};