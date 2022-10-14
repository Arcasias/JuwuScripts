import React, { useEffect, useRef, useState } from "react";
import { Script } from "./Script";
import { ScriptInfo, scripts as ALL_SCRIPTS } from "./scripts";
import {
  getClass,
  groupNameFromPath,
  normalize,
  storageGet,
  storageSet,
  THEME_STORAGE_KEY,
  useTheme,
} from "./utils";

import { KeyboardEventHandler } from "react";
import "./Popup.scss";

interface Group {
  name: string;
  scripts: ScriptInfo[];
}

const SEACH_KEYS: ((script: ScriptInfo) => string)[] = [
  (s) => s.title,
  (s) => s.id,
  (s) => s.path.join(" "),
  (s) => s.directives.description || "",
];

const getDefaultState = (
  scripts: ScriptInfo[],
  groups: Group[]
): [string | null, string | null] => {
  let defaultSelected: string | null = null;
  let defaultOpenGroup: string | null = null;
  if (scripts.length === 1 && groups.length === 0) {
    const [firstScript] = scripts;
    defaultSelected = firstScript.id;
  } else if (scripts.length === 0 && groups.length === 1) {
    const { name, scripts } = groups[0];
    defaultOpenGroup = name;
    if (scripts.length === 1) {
      defaultSelected = scripts[0].id;
    }
  }

  return [defaultSelected, defaultOpenGroup];
};

const processScripts = (query: string): [ScriptInfo[], Group[]] => {
  const filteredScripts = ALL_SCRIPTS.filter(
    (s) =>
      !query ||
      SEACH_KEYS.some((getKey) => normalize(getKey(s)).includes(query))
  );

  const groups: Record<string, Group> = {};
  const scripts: ScriptInfo[] = [];
  for (const script of filteredScripts) {
    const path = groupNameFromPath(script.path);
    if (path) {
      if (!(path in groups)) {
        groups[path] = { name: path, scripts: [] };
      }
      groups[path].scripts.push(script);
    } else {
      scripts.push(script);
    }
  }

  return [scripts, Object.values(groups)];
};

export const Popup = () => {
  const displayScripts = (scripts: ScriptInfo[]) =>
    scripts.map((script) => (
      <Script
        key={script.id}
        script={script}
        selected={selected === script.id}
        onClick={(el: HTMLElement) => {
          if (script.id !== selected) {
            setTimeout(() => el.scrollIntoView({ block: "center" }));
          }
          setSelected(script.id);
        }}
      />
    ));

  const navigate: KeyboardEventHandler = (ev) => {
    if ((!scripts.length && !groups.length) || !rootRef.current) {
      return;
    }
    const scriptEls = [...rootRef.current.querySelectorAll(".Script")];
    const { activeElement } = document;
    const activeScript = activeElement?.closest(".Script");
    const index = activeScript ? scriptEls.indexOf(activeScript) : -1;
    const key = ev.key.toLowerCase();
    switch (key) {
      case "arrowup": {
        ev.preventDefault();
        const prevEl = scriptEls.at(Math.max(index - 1, -1)) as HTMLElement;
        prevEl.focus();
        break;
      }
      case "arrowdown": {
        ev.preventDefault();
        const nextEl = scriptEls.at(
          (index + 1) % scriptEls.length
        ) as HTMLElement;
        nextEl.focus();
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
        inputRef.current?.focus();
        break;
      }
    }
  };

  const setAndUpdateQuery = () => {
    const newQuery = normalize(inputRef.current?.value || "");
    setQuery(newQuery);
    localStorage.setItem("query", newQuery);
    const [nextSelectedScript, nextOpenGroup] = getDefaultState(
      ...processScripts(newQuery)
    );
    if (nextSelectedScript) {
      setSelected(nextSelectedScript);
    }
    if (nextOpenGroup && !openGroups.includes(nextOpenGroup)) {
      toggleFold(nextOpenGroup);
    }
  };

  const toggleFold = (gname: string) => {
    setOpenGroups((of) =>
      of.includes(gname) ? of.filter((f) => f !== gname) : [...of, gname]
    );
  };

  const defaultQuery = localStorage.getItem("query") || "";

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultQuery);

  const [scripts, groups] = processScripts(query);
  const [defaultSelectedScript, defaultOpenGroup] = getDefaultState(
    scripts,
    groups
  );

  const { getThemeClass, isTheme, setTheme } = useTheme();
  const [selected, setSelected] = useState(defaultSelectedScript);
  const [openGroups, setOpenGroups] = useState(
    defaultOpenGroup ? [defaultOpenGroup] : []
  );

  // Disgusting hack to make the root take its actual width
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    rootRef.current?.setAttribute("style", "width:0px");
    setTimeout(() => rootRef.current?.removeAttribute("style"));
  }, []);

  // Get current or default theme
  useEffect(() => {
    const fetchTheme = async () => {
      const [result, error] = await storageGet(THEME_STORAGE_KEY);
      if (error) {
        console.debug(error);
      } else {
        const value = result[THEME_STORAGE_KEY];
        setTheme(value);
      }
    };
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      ref={rootRef}
      className={getThemeClass("Popup container-lg d-flex flex-column m-0")}
      onKeyDown={navigate}
    >
      <div className={getClass("input-group my-3 shadow")}>
        <input
          ref={inputRef}
          className={getThemeClass("form-control border-0")}
          type="search"
          name="search"
          value={query}
          onChange={setAndUpdateQuery}
          placeholder="Search script..."
          autoFocus
        />
        <button
          className={getThemeClass("btn")}
          onClick={() => setTheme(isTheme("light") ? "dark" : "light")}
          title="Toggle theme"
        >
          <i className={`bi bi-${isTheme("dark") ? "sun" : "moon"}-fill`} />
        </button>
      </div>
      <ul className="scripts overflow-auto pe-1 mb-3 h-100 list-group">
        {groups.map((group) => (
          <React.Fragment key={group.name}>
            <h6
              className={getThemeClass(
                "script-group-name list-group-item ps-2 m-0 border-0 d-flex animation-slide-right",
                openGroups.includes(group.name) && "text-warning"
              )}
              onClick={() => toggleFold(group.name)}
            >
              <span className="me-2">
                <i className="bi bi-folder-fill" />
              </span>
              <span>{group.name}</span>
              <span
                className={getClass(
                  "ms-auto script-group-caret d-flex align-items-center",
                  openGroups.includes(group.name) && "upside-down"
                )}
              >
                <i className="bi bi-caret-down-fill" />
              </span>
            </h6>
            {openGroups.includes(group.name) && (
              <div className="animation-slide-down ps-3">
                {displayScripts(group.scripts)}
              </div>
            )}
          </React.Fragment>
        ))}
        {displayScripts(scripts)}
        {!scripts.length && !groups.length && (
          <em className={getThemeClass("list-group-item text-muted")}>
            No result for "{query}"
          </em>
        )}
      </ul>
    </main>
  );
};
