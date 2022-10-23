import React, { useContext, useEffect, useMemo, useState } from "react";
import { TabContext } from "../providers/TabProvider";
import { ThemeContext } from "../providers/ThemeProvider";
import { TranslationContext } from "../providers/TranslationProvider";
import { ScriptInfo } from "../scripts";
import {
  canScriptRun,
  copyToClipboard,
  ErrorCatcher,
  executeScript,
  formatText,
  getClass,
  getGithubURL,
  isIcon,
  isLocal,
  isURL,
  parseWebsite,
} from "../utils/utils";

import "./Script.scss";
import { ScriptAlert } from "./ScriptAlert";
import { ScriptButton } from "./ScriptButton";

export interface ScriptProps {
  autorun: boolean;
  script: ScriptInfo;
  selected: boolean;
  toggleAutorun(): void;
  toggleSelected(): void;
}

const IMG_PATH = "../img/";
const RUN_TIMEOUT = 3e3;
const URL_DOESNT_MATCH = "Cannot run: URL doesn't match.";

export const Script = ({
  autorun,
  script,
  selected,
  toggleAutorun,
  toggleSelected,
}: ScriptProps) => {
  const addError = (error: Error | null) =>
    error &&
    !errors.includes(error.message) &&
    setErrors([error.message, ...errors]);

  const removeError = (error: string | null) =>
    error &&
    error.includes(error) &&
    setErrors((errors) => errors.filter((w) => w !== error));

  const addWarning = (warning: string | null) =>
    warning &&
    !warnings.includes(warning) &&
    setWarnings([warning, ...warnings]);

  const removeWarning = (warning: string | null) =>
    warning &&
    warning.includes(warning) &&
    setWarnings((warnings) => warnings.filter((w) => w !== warning));

  const getTextColor = () => {
    if (errors.length) {
      return "text-danger";
    } else if (autorun) {
      return "text-info";
    } else if (didRun) {
      return "text-success";
    }
  };

  const onKeyDown: React.KeyboardEventHandler = (ev) => {
    if (ev.key === "Enter") {
      if (directives.run) {
        runScript();
      } else if (!isClipboard && directives.autorun) {
        toggleAutorun();
      }
    }
  };

  const runScript = async () => {
    let result: ErrorCatcher<void>;
    if (isClipboard) {
      result = await copyToClipboard(content);
    } else if (canRun) {
      result = await executeScript(script, true);
    } else {
      return;
    }
    if (result[1]) {
      console.debug(result[1]);
      addError(result[1]);
    } else {
      setDidRun(true);
    }
  };

  const tryToToggleSelected = (ev: React.MouseEvent) => {
    if (!selected || (ev.target as HTMLElement).closest(".card-title")) {
      toggleSelected();
    }
  };

  const { directives, fileName, content, path } = script;

  const tab = useContext(TabContext);
  const theme = useContext(ThemeContext);
  const t = useContext(TranslationContext);

  const websiteInfo = useMemo(
    () => parseWebsite(directives.website),
    [directives.website]
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [didRun, setDidRun] = useState(false);

  const canRun = canScriptRun(script, tab);
  const icon =
    directives.icon || (websiteInfo && `${websiteInfo.origin}/favicon.ico`);
  const isClipboard = directives.run === "clipboard";

  useEffect(() => {
    if (didRun) {
      const timeout = window.setTimeout(() => {
        setDidRun(false);
      }, RUN_TIMEOUT);
      return () => window.clearTimeout(timeout);
    }
  }, [didRun]);

  useEffect(() => {
    if (canRun) {
      removeWarning(URL_DOESNT_MATCH);
    } else if (autorun) {
      addWarning(URL_DOESNT_MATCH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorun, canRun]);

  return (
    <li
      className={getClass(
        theme.className,
        "Script animation-slide-right border-0",
        selected
          ? "card selected my-2 shadow"
          : getClass(
              "list-group-item",
              icon && "ps-1",
              path.length > 1 && "ms-3"
            )
      )}
      tabIndex={0}
      onClick={tryToToggleSelected}
      onKeyDown={onKeyDown}
    >
      <div className="card-body">
        {/* Header */}
        <h6
          className={getClass(
            "card-title d-flex align-items-center m-0",
            getTextColor(),
            !canRun && "opacity-50",
            !selected && "m-0"
          )}
        >
          {icon && (
            <span className="me-2 d-flex">
              {isIcon(icon) ? (
                <i
                  className={`bi ${icon}${theme.is("light") ? "-fill" : ""}`}
                />
              ) : (
                <img
                  className="mh-100 w-auto"
                  width={16}
                  height={16}
                  src={isURL(icon) ? icon : require(IMG_PATH + icon)}
                  alt={t(directives.title)}
                />
              )}
            </span>
          )}
          {/* Title */}
          <span
            className={getClass(
              getTextColor(),
              "script-title text-truncate w-100"
            )}
            title={t(
              directives.title +
                (canRun ? (autorun ? " (running)" : "") : " (disabled)")
            )}
          >
            {formatText(t(directives.title))}
          </span>
          {/* Run actions */}
          <div className="ms-auto btn-group">
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
                title={t(isClipboard ? "Copy to clipboard" : "Run script")}
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
                  autorun && "text-info animation-spin"
                )}
                onClick={(ev) => {
                  ev.stopPropagation();
                  toggleAutorun();
                }}
                title={t(
                  autorun ? "Stop autorunning" : "Autorun script at page load"
                )}
              >
                <i className="bi bi-arrow-repeat" />
              </button>
            )}
          </div>
        </h6>
        {/* Description */}
        {selected && directives.description && (
          <p className="card-text mt-2">
            {formatText(t(directives.description))}
          </p>
        )}
      </div>
      {selected && (
        <ul className="border-0 list-group list-group-flush">
          {/* Delay */}
          {directives.delay && (
            <li
              className={getClass(theme.className, "list-group-item")}
              title={t(
                `This script will run after ${directives.delay} milliseconds after page load`
              )}
            >
              <div className="badge rounded-pill text-bg-secondary me-2">
                {t("delay")}
              </div>
              {t(`${directives.delay / 1000} seconds`)}
            </li>
          )}
          {/* Exports */}
          {Object.entries(directives.exports).map(([key, type]) => (
            <li
              key={key}
              className={getClass(theme.className, "list-group-item")}
            >
              <div className="badge rounded-pill text-bg-secondary me-2">
                {t("exports")}
              </div>
              {t(type)}: <code>{t(key)}</code>
            </li>
          ))}
          {/* Error messages */}
          {errors.map((error) => (
            <ScriptAlert
              key={error}
              className="danger"
              dismiss={() => removeError(error)}
              message={t(error)}
            />
          ))}
          {/* Warning messages */}
          {warnings.map((warning) => (
            <ScriptAlert
              key={warning}
              className="warning"
              dismiss={() => removeWarning(warning)}
              message={t(warning)}
            />
          ))}
        </ul>
      )}
      {selected && (
        <footer className="card-footer d-flex align-items-center user-select-none">
          {!isLocal(path) && (
            <ScriptButton
              title={t("Open on Github")}
              url={getGithubURL(...path, fileName)}
            >
              <i className="bi bi-github" />
            </ScriptButton>
          )}
          {websiteInfo && (
            <ScriptButton title={t("Go to Website")} url={websiteInfo.href}>
              <i className="bi bi-globe2" />
            </ScriptButton>
          )}
          {isLocal(path) && (
            <code className="text-muted ms-auto">{t("Local file")}</code>
          )}
        </footer>
      )}
    </li>
  );
};
