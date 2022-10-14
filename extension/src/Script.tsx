import React, { useEffect, useState } from "react";
import { ScriptInfo } from "./scripts";
import {
  copyToClipboard,
  ErrorCatcher,
  executeScript,
  formatText,
  getClass,
  getGithubURL,
  getWebsiteHostname,
  isLocal,
  LIST_ITEM_CLASS,
  storageGet,
  storageRemove,
  storageSet,
} from "./utils";

import "./Script.scss";

export interface ScriptProps {
  script: ScriptInfo;
  selected: boolean;
  onClick: (el: HTMLElement) => any;
}

export const Script = ({
  script: { directives, exports, fileName, id, content, title, path },
  selected,
  onClick,
}: ScriptProps) => {
  const getTextColor = () => {
    if (error) {
      return "text-danger";
    } else if (autorun) {
      return "text-info";
    } else if (runCount > 0) {
      return "text-success";
    }
  };

  const runScript = async () => {
    let result: ErrorCatcher<any>;
    if (isClipboard) {
      result = await copyToClipboard(content);
    } else {
      result = await executeScript(fileName);
    }
    if (result[1]) {
      console.debug(result[1]);
      setError(result[1]);
    }
    setRunCount(runCount + 1);
  };

  const toggleAutorun = async () => {
    const previous = autorun;
    const activate = !autorun;
    setAutorun(activate);
    let result: ErrorCatcher<true>;
    if (activate) {
      result = await storageSet({
        [id]: { fileName, hostName, id },
      });
    } else {
      result = await storageRemove(id);
    }
    if (result[1]) {
      console.debug(result[1]);
      setAutorun(previous);
      setError(result[1]);
    }
    if (activate && runCount === 0) {
      runScript();
    }
  };

  const isClipboard = directives.run === "clipboard";
  const [error, setError] = useState<Error | null>(null);
  const [autorun, setAutorun] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const hostName =
    (directives.website && getWebsiteHostname(directives.website)) || false;

  useEffect(() => {
    const fetchAutorun = async () => {
      const [result, error] = await storageGet(id);
      if (error) {
        console.debug(error);
        setError(error);
      } else {
        const value = Boolean(result[id]);
        setAutorun(value);
        if (value) {
          setRunCount((count) => count + 1); // FE here to avoid deps
        }
      }
    };
    fetchAutorun();
  }, [id]);

  return (
    <li
      className={getClass(
        "Script text-bg-dark animation-slide-right",
        selected
          ? "card selected border-primary my-2"
          : "list-group-item border-0"
      )}
      tabIndex={0}
      onClick={(ev) => onClick(ev.target as HTMLElement)}
      onKeyDown={(ev) =>
        ev.key === "Enter" && onClick(ev.target as HTMLElement)
      }
    >
      <div className="card-body">
        <h6
          className={getClass(
            "script-title card-title d-flex align-items-center",
            getTextColor(),
            !selected && "m-0"
          )}
        >
          {directives.icon && (
            <span className="me-2">
              <i className={`bi ${directives.icon}`} />
            </span>
          )}
          <span className="text-truncate w-100" title={title}>
            {title}
          </span>
          <div className="ms-auto btn-group">
            {directives.run && !autorun && (
              <button
                className={getClass(
                  `btn border-0 p-0 ps-1 text-${
                    runCount > 0 ? "success" : "light"
                  }`,
                  runCount > 0 && "animation-grow"
                )}
                onClick={(ev) => {
                  ev.stopPropagation();
                  runScript();
                }}
                title={isClipboard ? "Copy to clipboard" : "Run script"}
              >
                <i
                  className={`bi bi-${isClipboard ? "clipboard" : "play"}-fill`}
                />
              </button>
            )}
            {!isClipboard && directives.autorun && (
              <button
                className={getClass(
                  `btn border-0 p-0 px-1 text-${autorun ? "info" : "light"}`,
                  autorun && "animation-spin"
                )}
                onClick={(ev) => {
                  ev.stopPropagation();
                  toggleAutorun();
                }}
                title={
                  autorun ? "Stop autorunning" : "Autorun script at page load"
                }
              >
                <i className="bi bi-arrow-repeat" />
              </button>
            )}
          </div>
        </h6>
        {selected && (
          <p className="card-text">
            {directives.description ? (
              formatText(directives.description)
            ) : (
              <>No description for this script.</>
            )}
          </p>
        )}
      </div>
      {selected && (
        <ul className="border-0 list-group list-group-flush">
          {directives.website && (
            <li className={LIST_ITEM_CLASS}>
              <div className="badge rounded-pill text-bg-secondary me-2">
                website
              </div>
              <a
                href={directives.website}
                target="_blank"
                rel="noreferrer"
                className="card-link"
              >
                {hostName}
              </a>
            </li>
          )}
          {directives.use && (
            <li className={LIST_ITEM_CLASS}>
              <div className="badge rounded-pill text-bg-secondary me-2">
                use
              </div>
              {formatText(directives.use)}
            </li>
          )}
          {Object.entries(exports).map(([key, type]) => (
            <li key={key} className={`${LIST_ITEM_CLASS}`}>
              <div className="badge rounded-pill text-bg-secondary me-2">
                exports
              </div>
              {type}: <code>{key}</code>
            </li>
          ))}
          {error && (
            <li
              className={`${LIST_ITEM_CLASS} d-flex align-items-center justify-content-between`}
            >
              <em className="text-danger me-2">Error: check the console</em>
              <button
                className="btn btn-sm border border-danger text-danger"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </li>
          )}
        </ul>
      )}
      {selected && (
        <footer className="card-footer d-flex align-items-center justify-content-between">
          <code className="text-muted">
            {isLocal(path) ? (
              <span>Local file</span>
            ) : (
              <a
                href={getGithubURL(...path, fileName)}
                target="_blank"
                rel="noreferrer"
                className="text-reset text-decoration-none"
              >
                Open on Github <i className="bi bi-box-arrow-up-right" />
              </a>
            )}
          </code>
        </footer>
      )}
    </li>
  );
};
