/*global chrome*/
import { useEffect, useState } from "react";
import "./Script.scss";

const getWebsiteHostname = (website) => {
  const a = document.createElement("a");
  a.href = website;
  return a.hostname;
};

const formatText = (text) => {
  const codeBlocks = [];
  const replaced = text.replace(/`([^`]+)`/g, (_, block) => {
    codeBlocks.push(block);
    return "%BLOCK%";
  });
  const parts = replaced.split("%BLOCK%");
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parts[i]);
    if (codeBlocks[i]) {
      result.push(<code key={i}>{codeBlocks[i]}</code>);
    }
  }
  return result;
};

const LIST_ITEM_CLASS = "list-group-item bg-dark text-light";

export const Script = ({
  script: {
    id,
    fileName,
    title,
    directives: { description, result, use, website },
  },
  hovered,
  onHover,
}) => {
  const storageId = `autorun_${id}`;
  const [status, setStatus] = useState(null);
  let locked = false;

  const [autoRunning, setAutorunning] = useState(false);

  useEffect(() => {
    const fetchAutorunning = async () => {
      try {
        const value = await chrome.storage.sync.get(storageId);
        setAutorunning(value[storageId]);
      } catch (err) {
        console.debug(err);
        setAutorunning(false);
      }
    };
    fetchAutorunning();
  }, [storageId]);

  const setAutorun = async (activate) => {
    if (locked) {
      return;
    }
    const previous = autoRunning;
    setAutorunning(activate);
    try {
      await chrome.storage.sync.set({ [storageId]: activate });
    } catch (err) {
      setAutorunning(previous);
      console.debug(err);
    }
    if (status === "active") {
      return;
    }
    if (activate) {
      run();
    } else {
      setStatus(null);
    }
  };

  const run = async () => {
    if (locked) {
      return;
    }
    locked = true;
    setStatus("loading");
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [`./src/public/${fileName}`],
      });
      setStatus("active");
    } catch (err) {
      console.debug(err);
      setStatus("error");
    } finally {
      locked = false;
    }
  };

  const getStatusClass = () => {
    if (status === "active") {
      return "success";
    } else if (status === "error") {
      return "danger";
    } else {
      return "muted";
    }
  };

  return (
    <li
      className={`script card bg-dark mt-2 ${
        status ? "border-" + getStatusClass() : ""
      } ${hovered ? "hovered" : ""}`}
      tabIndex="0"
      onMouseEnter={onHover}
    >
      <div className="card-body">
        <h5
          className={`script-title card-title ${
            status ? "text-" + getStatusClass() : ""
          }`}
        >
          {title}
        </h5>
        {hovered && description && (
          <p className="card-text">{formatText(description)}</p>
        )}
      </div>
      {hovered && (
        <ul className="border-0 list-group list-group-flush">
          {website && (
            <li className={LIST_ITEM_CLASS}>
              Website:{" "}
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="card-link"
              >
                {getWebsiteHostname(website)}
              </a>
            </li>
          )}
          {use && <li className={LIST_ITEM_CLASS}>Use: {use}</li>}
        </ul>
      )}
      {hovered && !result && (
        <footer className="card-footer d-flex align-items-center">
          {status === "loading" ? (
            <span className="fst-italic text-muted">Loading...</span>
          ) : status === "error" ? (
            <span className="d-flex align-items-center justify-content-between">
              <span className="fst-italic text-danger">
                Error: check the console{" "}
              </span>
              <button
                className="btn btn-sm border border-danger text-danger"
                onClick={() => setStatus(null)}
              >
                Dismiss
              </button>
            </span>
          ) : (
            <>
              {!autoRunning &&
                (status ? (
                  <span className={`fst-italic text-${getStatusClass()} me-2`}>
                    {status === "active" ? <>Active</> : <>Loading ...</>}
                  </span>
                ) : (
                  <button className="btn btn-sm btn-primary me-2" onClick={run}>
                    Run
                  </button>
                ))}
              {status !== "error" &&
                (autoRunning ? (
                  <>
                    <span className="fst-italic text-success me-2">
                      Auto running
                    </span>
                    <button
                      className="btn btn-sm border border-danger text-danger"
                      onClick={() => setAutorun(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setAutorun(true)}
                  >
                    Autorun
                  </button>
                ))}
            </>
          )}
        </footer>
      )}
    </li>
  );
};
