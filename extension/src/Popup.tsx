import React, { useEffect, useRef, useState } from "react";
import { Script } from "./Script";
import { ScriptInfo, scripts as ALL_SCRIPTS } from "./scripts";
import {
  getClass,
  groupNameFromPath,
  LIST_ITEM_CLASS,
  normalize,
} from "./utils";

import { KeyboardEventHandler } from "react";
import "./Popup.scss";

interface Group {
  name: string;
  scripts: ScriptInfo[];
}

const SEACH_KEYS = [
  (s: ScriptInfo) => s.title,
  (s: ScriptInfo) => s.id,
  (s: ScriptInfo) => s.directives.description || "",
];

const getDefaultState = (
  scripts: ScriptInfo[],
  groups: Group[]
): [string | null, string | null] => {
  let defaultSelected: string | null = null;
  let defaultOpenGroup: string | null = null;
  if (scripts.length === 1) {
    const [firstScript] = scripts;
    defaultSelected = firstScript.id;
  } else if (scripts.length === 0 && groups.length === 1) {
    const { name, scripts } = groups[0];
    defaultSelected = scripts[0].id;
    defaultOpenGroup = name;
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
    if (!scripts.length || !rootRef.current) {
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
              className={getClass(
                "script-group-name",
                LIST_ITEM_CLASS,
                "m-0 d-flex",
                openGroups.includes(group.name) ? "text-warning" : "text-light"
              )}
              onClick={() => toggleFold(group.name)}
            >
              <span className="me-2">
                <i className="bi bi-folder-fill" />
              </span>
              <span>{group.name}</span>
              <span className="ms-auto">
                <i
                  className={`bi bi-caret-${
                    openGroups.includes(group.name) ? "up" : "down"
                  }-fill`}
                />
              </span>
            </h6>
            {openGroups.includes(group.name) && (
              <div className="script-group-content ps-4">{displayScripts(group.scripts)}</div>
            )}
          </>
        ))}
        {displayScripts(scripts)}
        {!scripts.length && !groups.length && (
          <em className="list-group-item bg-dark text-muted">
            No result for "{query}"
          </em>
        )}
      </ul>
    </main>
  );
};
