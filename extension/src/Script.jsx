import { useEffect, useState } from "react";
import "./Script.scss";
import { scripting, storage, tabs } from "./services";
import { getClass } from "./utils";

const REPLACERS = [
  ["`", "code"],
  ["**", "strong"],
  ["*", "em"],
];
const SCRIPTS_PATH = "./extension/scripts/";

const formatText = (text, replacers = [...REPLACERS]) => {
  const [marker, TagName] = replacers.shift();
  const parts = text.split(marker);
  for (let i = 0; i < parts.length; i++) {
    const value = replacers.length
      ? formatText(parts[i], [...replacers])
      : parts[i];
    parts[i] = i > 0 && i % 2 ? <TagName key={i}>{value}</TagName> : value;
  }
  return parts;
};

const getWebsiteHostname = (url) => {
  const a = document.createElement("a");
  a.href = url;
  return a.hostname;
};

const LIST_ITEM_CLASS = "list-group-item text-bg-dark";

export const Script = ({
  script: {
    directives,
    exports,
    fileName,
    id,
    minContent,
    minFileName,
    title,
    url,
  },
  debug,
  selected,
  onClick,
}) => {
  const copyToClipboard = async () => {
    if (minContent) {
      try {
        await navigator.clipboard.writeText(minContent);
      } catch (err) {
        setError(err);
      }
    } else {
      console.debug(`Could not copy script: the content is empty.`);
    }
  };

  const executeScript = async () => {
    try {
      const [tab] = await tabs.query({
        active: true,
        currentWindow: true,
      });
      await scripting.executeScript({
        target: { tabId: tab.id },
        files: [SCRIPTS_PATH + (debug ? fileName : minFileName)],
        world: "MAIN",
      });
    } catch (err) {
      console.debug(err);
      setError(err);
    }
  };

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
    if (isClipboard) {
      await copyToClipboard();
    } else {
      await executeScript();
    }
    setRunCount(runCount + 1);
  };

  const toggleAutorun = async () => {
    const previous = autorun;
    const activate = !autorun;
    setAutorun(activate);
    try {
      if (activate) {
        await storage.sync.set({
          [id]: { fileName, hostName, id, minFileName },
        });
      } else {
        await storage.sync.remove(id);
      }
    } catch (err) {
      console.debug(err);
      setAutorun(previous);
      setError(err);
    }
    if (activate && runCount === 0) {
      runScript();
    }
  };

  const isClipboard = directives.run === "clipboard";
  const [error, setError] = useState(null);
  const [autorun, setAutorun] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const hostName =
    (directives.website && getWebsiteHostname(directives.website)) || false;

  useEffect(() => {
    const fetchAutorun = async () => {
      try {
        const result = await storage.sync.get(id);
        const value = Boolean(result[id]);
        setAutorun(value);
        if (value) {
          setRunCount((count) => count + 1); // FE here to avoid deps
        }
      } catch (err) {
        console.debug(err);
        setError(err);
      }
    };
    fetchAutorun();
  }, [id]);

  return (
    <li
      className={getClass(
        "Script text-bg-dark",
        selected
          ? "card selected border-primary my-2"
          : "list-group-item border-0"
      )}
      tabIndex="0"
      onClick={onClick}
      onKeyDown={(ev) => ev.key === "Enter" && onClick(ev)}
    >
      <div className="card-body">
        <h6
          className={getClass(
            "script-title card-title d-flex align-items-center",
            getTextColor(),
            !selected && "m-0"
          )}
        >
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
                  runCount > 0 && "grow"
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
                  autorun && "spin"
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
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-reset text-decoration-none"
              >
                Open on Github <i className="bi bi-box-arrow-up-right" />
              </a>
            ) : (
              <span>Local file</span>
            )}
          </code>
        </footer>
      )}
    </li>
  );
};
