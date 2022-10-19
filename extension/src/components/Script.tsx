import React, { useContext, useEffect, useMemo, useState } from "react";
import { TabContext } from "../providers/TabProvider";
import { ThemeContext } from "../providers/ThemeProvider";
import { ScriptInfo } from "../scripts";
import {
  canScriptRun,
  copyToClipboard,
  ErrorCatcher,
  executeScript,
  formatText,
  getClass,
  getGithubURL,
  getWebsiteHostName,
  groupNameFromPath,
  isLocal,
  isURL,
} from "../utils/utils";

import "./Script.scss";

export interface ScriptProps {
  autorun: boolean;
  script: ScriptInfo;
  selected: boolean;
  toggleAutorun(): void;
  toggleSelected(): void;
}

const IMG_PATH = "../img/";
const RUN_TIMEOUT = 2500;

export const Script = ({
  autorun,
  script,
  selected,
  toggleAutorun,
  toggleSelected,
}: ScriptProps) => {
  const getTextColor = () => {
    if (error) {
      return "text-danger";
    } else if (!canRun) {
      return "text-muted";
    } else if (autorun) {
      return "text-info";
    } else if (didRun) {
      return "text-success";
    }
  };

  const runScript = async () => {
    let result: ErrorCatcher<any>;
    if (isClipboard) {
      result = await copyToClipboard(content);
    } else {
      result = await executeScript(script, true);
    }
    if (result[1]) {
      console.debug(result[1]);
      setError(result[1]);
    } else {
      setDidRun(true);
    }
  };

  const tryToToggleSelected = (ev: React.MouseEvent | React.KeyboardEvent) => {
    if (!selected || (ev.target as HTMLElement).closest(".card-title")) {
      toggleSelected();
    }
  };

  const { directives, fileName, content, path } = script;

  const tab = useContext(TabContext);
  const theme = useContext(ThemeContext);

  const isClipboard = directives.run === "clipboard";
  const [error, setError] = useState<Error | null>(null);
  const [didRun, setDidRun] = useState(false);
  const canRun = useMemo(() => canScriptRun(script, tab), [script, tab]);

  let { image } = directives;
  if (!image && directives.website) {
    let website = directives.website;
    if (!website.endsWith("/")) {
      website += "/";
    }
    image = website + "favicon.ico";
  }

  useEffect(() => {
    if (didRun) {
      const timeout = window.setTimeout(() => {
        setDidRun(false);
      }, RUN_TIMEOUT);
      return () => window.clearTimeout(timeout);
    }
  }, [didRun]);

  return (
    <li
      className={getClass(
        theme.className,
        "Script animation-slide-right border-0",
        selected
          ? "card selected my-2 shadow"
          : getClass(
              "list-group-item",
              (image || directives.icon) && "ps-1",
              groupNameFromPath(path) && "ms-3"
            )
      )}
      tabIndex={0}
      onClick={tryToToggleSelected}
      onKeyDown={(ev) => ev.key === "Enter" && tryToToggleSelected(ev)}
    >
      <div className="card-body">
        <h6
          className={getClass(
            "card-title d-flex align-items-center",
            getTextColor(),
            !selected && "m-0"
          )}
        >
          {(image || directives.icon) && (
            <span className="me-2 d-flex">
              {image ? (
                <img
                  className="mh-100 w-auto"
                  width={16}
                  height={16}
                  src={isURL(image) ? image : require(IMG_PATH + image)}
                  alt={image}
                />
              ) : (
                <i className={`bi bi-${directives.icon}`} />
              )}
            </span>
          )}
          <span
            className={getClass(
              getTextColor(),
              "script-title text-truncate w-100"
            )}
            title={
              directives.title +
              (canRun ? (autorun ? " (running)" : "") : " (disabled)")
            }
          >
            {directives.title}
          </span>
          <div className={getClass(getTextColor(), "ms-auto btn-group")}>
            {directives.run && canRun && (
              <button
                className={getClass(
                  theme.className,
                  "btn border-0 p-0 ps-1",
                  didRun
                    ? "text-success animation-grow"
                    : autorun && "text-info"
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
                  theme.className,
                  "btn border-0 p-0 px-1",
                  canRun ? autorun && "text-info" : "text-muted",
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
            <li className={getClass(theme.className, "list-group-item")}>
              <div className="badge rounded-pill text-bg-secondary me-2">
                website
              </div>
              <a
                href={directives.website}
                target="_blank"
                rel="noreferrer"
                className="card-link"
              >
                {getWebsiteHostName(directives.website)}
              </a>
            </li>
          )}
          {Object.entries(directives.exports).map(([key, type]) => (
            <li
              key={key}
              className={getClass(theme.className, "list-group-item")}
            >
              <div className="badge rounded-pill text-bg-secondary me-2">
                exports
              </div>
              {type}: <code>{key}</code>
            </li>
          ))}
          {!canRun && (
            <li className={getClass(theme.className, "list-group-item")}>
              <div
                className="bg-warning bg-opacity-25 border-warning rounded-1 border-3 m-0 border-start px-3 py-2 shadow"
                style={{ fontSize: "0.9em" }}
              >
                <span className="opacity-75">
                  <i className="bi bi-exclamation-triangle-fill d-inline me-1" />
                  Cannot run: URL doesn't match
                </span>
              </div>
            </li>
          )}
          {error && (
            <li
              className={getClass(
                theme.className,
                "list-group-item d-flex align-items-center justify-content-between"
              )}
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
        <footer className="card-footer d-flex user-select-none align-items-center justify-content-between">
          <code className="text-muted">
            {isLocal(path) ? (
              <>Local file</>
            ) : (
              <a
                href={getGithubURL(...path, fileName)}
                target="_blank"
                rel="noreferrer"
                className="text-reset text-decoration-none d-flex"
              >
                Open on Github
                <i className="bi bi-box-arrow-up-right ms-2" />
              </a>
            )}
          </code>
        </footer>
      )}
    </li>
  );
};
