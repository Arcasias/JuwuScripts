import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "../providers/ThemeProvider";
import { ScriptInfo, scripts as ALL_SCRIPTS } from "../scripts";
import {
  canScriptRun,
  executeScript,
  getClass,
  getId,
  getStorageInfo,
  groupNameFromPath,
  normalize,
  storageGet,
  storageRemove,
  storageSet,
} from "../utils/utils";
import { Group, ScriptGroup } from "./Group";
import { Script } from "./Script";

import { TabContext } from "../providers/TabProvider";
import "./App.scss";

const QUERY_STORAGE_KEY = "query";
const SEACH_KEYS: ((script: ScriptInfo) => string)[] = [
  (s) => s.path.join(" "),
  (s) => s.directives.title,
  (s) => s.directives.description || "",
];

const defaultQuery = localStorage.getItem(QUERY_STORAGE_KEY) || ",false";
const [defaultSearchString, defaultFilterEnabled, defaultFilterRunning] =
  defaultQuery.split(",");

const getDefaultState = (
  scripts: ScriptInfo[],
  groups: ScriptGroup[],
  ..._args: any[]
) => {
  let selectedScript: string | null = null;
  const openGroups: string[] = [];

  if (scripts.length === 1 && groups.length === 0) {
    const [firstScript] = scripts;
    selectedScript = getId(firstScript);
  } else if (scripts.length === 0 && groups.length === 1) {
    const { name, scripts } = groups[0];
    openGroups.push(name);
    if (scripts.length === 1) {
      selectedScript = getId(scripts[0]);
    }
  }

  return { selectedScript, openGroups };
};

export const App = () => {
  const displayScripts = (scripts: ScriptInfo[]) =>
    scripts.map((script) => (
      <Script
        key={getId(script)}
        autorun={autorun[getId(script)]}
        script={script}
        selected={selected === getId(script)}
        toggleAutorun={() => toggleAutorun(script)}
        toggleSelected={() => toggleSelected(script)}
      />
    ));

  const navigate: React.KeyboardEventHandler = (ev) => {
    if (!scriptsLength || !rootRef.current) {
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

  const toggleAutorun = async (script: ScriptInfo) => {
    const id = getId(script);
    if (!(id in autorun)) {
      executeScript(script);
    }
    if (autorun[id]) {
      await storageRemove(id);
    } else {
      await storageSet({ [id]: getStorageInfo(script) });
    }
    setAutorun((autorun) => ({ ...autorun, [id]: !autorun[id] }));
  };

  const toggleFold = (groupName: string) => {
    setOpenGroups((og) =>
      og.includes(groupName)
        ? og.filter((f) => f !== groupName)
        : [...og, groupName]
    );
  };

  const toggleSelected = (script: ScriptInfo) => {
    const id = getId(script);
    setSelected(selected === id ? null : id);
  };

  const tab = useContext(TabContext);
  const theme = useContext(ThemeContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [searchString, setSearchString] = useState(defaultSearchString);
  const [filterRunning, setFilterRunning] = useState(
    defaultFilterRunning === "true"
  );
  const [filterEnabled, setFilterEnabled] = useState(
    defaultFilterEnabled === "true"
  );
  const [autorun, setAutorun] = useState<Record<string, boolean>>({});
  const [displayOptions, setDisplayOptions] = useState(false);

  const [scripts, groups, scriptsLength] = useMemo(() => {
    const filteredScripts = ALL_SCRIPTS.filter(
      (script) =>
        (!filterRunning || autorun[getId(script)]) &&
        (!filterEnabled || canScriptRun(script, tab)) &&
        (!searchString ||
          SEACH_KEYS.some((getKey) =>
            normalize(getKey(script)).includes(searchString)
          ))
    );
    const groups: Record<string, ScriptGroup> = {};
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
    return [scripts, Object.values(groups), filteredScripts.length];
  }, [tab, autorun, searchString, filterEnabled, filterRunning]);

  const [selected, setSelected] = useState(
    getDefaultState(scripts, groups).selectedScript
  );
  const [openGroups, setOpenGroups] = useState(
    getDefaultState(scripts, groups).openGroups
  );

  // Disgusting hack to make the root take its actual width
  useEffect(() => {
    rootRef.current?.setAttribute("style", "width:0px");
    requestAnimationFrame(() => rootRef.current?.removeAttribute("style"));
  }, []);

  // Get autorun values of each script
  useEffect(() => {
    const fetchAutorun = async () => {
      const [result, error] = await storageGet();
      if (error) {
        console.error(error);
      } else {
        const updatedAutorun: Record<string, boolean> = {};
        for (const value of Object.keys(result)) {
          updatedAutorun[value] = true;
        }
        setAutorun((autorun) => ({ ...autorun, ...updatedAutorun }));
      }
    };
    fetchAutorun();
  }, []);

  // Set query elements in the local storage
  useEffect(() => {
    localStorage.setItem(
      QUERY_STORAGE_KEY,
      [searchString, filterEnabled, filterRunning].join(",")
    );
  }, [searchString, filterEnabled, filterRunning]);

  useEffect(() => {
    const { selectedScript, openGroups } = getDefaultState(scripts, groups);
    if (selectedScript) {
      setSelected(selectedScript);
    }
    if (openGroups.length) {
      setOpenGroups(openGroups);
    }
  }, [scripts, groups]);

  return (
    <main
      ref={rootRef}
      className={getClass(
        theme.className,
        "App container-lg d-flex flex-column m-0"
      )}
      onKeyDown={navigate}
    >
      <div className="d-flex p-2 my-2 shadow">
        <input
          ref={inputRef}
          className={getClass(theme.className, "form-control border-0 p-0 ps-2")}
          type="search"
          name="search"
          value={searchString}
          onChange={() => setSearchString(normalize(inputRef.current!.value))}
          placeholder={`Search accross ${scriptsLength} scripts`}
          autoFocus
        />
        <div
          className="ms-2 badge rounded-pill shadow d-flex align-items-center"
          onMouseEnter={() => setDisplayOptions(true)}
          onMouseLeave={() => setDisplayOptions(false)}
        >
          {displayOptions ? (
            <span className="animation-slide-left">
              <button
                className={getClass(
                  `btn-${theme.is("dark") ? "dark" : "light"}`,
                  "btn m-0 p-1 me-1 animation-slide-right",
                  filterEnabled && "text-success"
                )}
                onClick={() => setFilterEnabled((current) => !current)}
                title="Only show scripts that can be run on this page"
              >
                <i className="bi bi-play-fill" />
              </button>
              <button
                className={getClass(
                  `btn-${theme.is("dark") ? "dark" : "light"}`,
                  "btn m-0 p-1 me-1",
                  filterRunning && "text-info"
                )}
                onClick={() => setFilterRunning((current) => !current)}
                title="Only show running scripts"
              >
                <i className="bi bi-arrow-repeat" />
              </button>
              <button
                className={getClass(
                  `btn-${theme.is("dark") ? "dark" : "light"}`,
                  "btn m-0 p-1"
                )}
                onClick={() => theme.toggle()}
                title="Toggle theme"
              >
                <i
                  className={`bi bi-${theme.is("dark") ? "sun" : "moon"}-fill`}
                />
              </button>
            </span>
          ) : (
            <button
              className={getClass(
                `btn-${theme.is("dark") ? "dark" : "light"}`,
                "btn m-0 p-1 animation-slide-right"
              )}
            >
              <i className="bi bi-gear-fill" />
            </button>
          )}
        </div>
      </div>
      <ul className="scripts overflow-auto pe-1 mb-3 h-100 list-group">
        {groups.map((group) => (
          <Group
            key={group.name}
            autorun={autorun}
            group={group}
            open={openGroups.includes(group.name)}
            toggleOpen={() => toggleFold(group.name)}
          >
            {displayScripts(group.scripts)}
          </Group>
        ))}
        {displayScripts(scripts)}
        {!scriptsLength && (
          <em
            className={getClass(theme.className, "list-group-item text-muted")}
          >
            No result {searchString && <>for "{searchString}"</>}
          </em>
        )}
      </ul>
    </main>
  );
};