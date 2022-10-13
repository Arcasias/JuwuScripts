import { useEffect, useRef, useState } from "react";
import "./Popup.scss";
import { Script } from "./Script";
import { SCRIPTS } from "./scripts";

const SEACH_KEYS = [
  (s) => s.title,
  (s) => s.id,
  (s) => s.directives.description || "",
];

const processScripts = (query) => {
  const filteredScripts = SCRIPTS.filter(
    (s) =>
      !query ||
      SEACH_KEYS.some((getKey) => normalize(getKey(s)).includes(query))
  );

  const groups = {};
  const scripts = [];
  for (const script of filteredScripts) {
    const groupName = script.directives.group;
    if (!groupName) {
      scripts.push(script);
      continue;
    }
    if (!(groupName in groups)) {
      groups[groupName] = {
        name: groupName,
        scripts: [],
      };
    }
    groups[groupName].scripts.push(script);
  }

  return [scripts, Object.values(groups)];
};

const normalize = (str, condensed = false) =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(condensed ? /[^a-z0-9]/g : /[\u0300-\u036f]/g, "");

export const Popup = () => {
  const navigate = (ev) => {
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

  const setAndUpdateQuery = (ev) => {
    const newQuery = normalize(ev.target.value);
    setQuery(newQuery);
    localStorage.setItem("query", newQuery);
    const [nextScripts, nextGroups] = processScripts(newQuery);
    if (nextScripts.length === 1) {
      // Select first script
      setSelected(nextScripts[0].id);
    } else if (
      nextScripts.length === 0 &&
      nextGroups.length === 1 &&
      nextGroups[0].scripts.length === 1
    ) {
      // Select first script of first group
      setSelected(nextGroups[0].scripts[0].id);
    }
  };

  const defaultQuery = localStorage.getItem("query") || "";

  const inputRef = useRef(null);
  const [query, setQuery] = useState(defaultQuery);

  const [scripts, groups] = processScripts(query);

  const [folded, setFolded] = useState([]);
  const [selected, setSelected] = useState(
    scripts.length === 1 ? scripts[0].id : null
  );

  // Disgusting hack to make the root take its actual width
  const rootRef = useRef(null);
  useEffect(() => {
    rootRef.current.setAttribute("style", "width:0px");
    setTimeout(() => rootRef.current.removeAttribute("style"));
  }, []);

  const displayScripts = (scripts) =>
    scripts.map((script) => (
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
    ));

  const toggleFold = (gname) => {
    if (folded.includes(gname)) {
      setFolded(folded.filter((f) => f !== gname));
    } else {
      setFolded([...folded, gname]);
    }
  };

  return (
    <main
      ref={rootRef}
      className="Popup container-lg d-flex flex-column m-0 text-bg-dark"
      onKeyDown={navigate}
    >
      <div className="input-group my-3">
        <input
          ref={inputRef}
          className="form-control text-bg-dark"
          type="search"
          name="search"
          value={query}
          onChange={setAndUpdateQuery}
          placeholder="Search script..."
          autoFocus
        />
      </div>
      <ul className="scripts overflow-auto mb-3 pe-2 h-100 list-group">
        {groups.map((group) => (
          <>
            <h6
              key={group.name}
              className="list-group-item text-warning bg-dark m-0 d-flex"
              style={{ cursor: "pointer", opacity: 0.8 }}
              onClick={() => toggleFold(group.name)}
            >
              <span>{group.name}</span>
              <span className="ms-auto">
                <i className={`bi bi-caret-${folded.includes(group.name) ? "down" : "up"}-fill`} />
              </span>
            </h6>
            {!folded.includes(group.name) && displayScripts(group.scripts)}
          </>
        ))}
        {displayScripts(scripts)}
        {!scripts.length && (
          <em className="list-group-item bg-dark text-muted">
            No result for "{query}"
          </em>
        )}
      </ul>
    </main>
  );
};
