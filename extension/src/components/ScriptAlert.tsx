import React, { useContext } from "react";
import { ThemeContext } from "../providers/ThemeProvider";
import { getClass } from "../utils/utils";

interface ScriptAlertProps {
  className: string;
  dismiss(): any;
  message: string;
}

export const ScriptAlert = ({
  dismiss,
  message,
  className,
}: ScriptAlertProps) => {
  const theme = useContext(ThemeContext);
  return (
    <li
      className={getClass(
        theme.className,
        "list-group-item border-0 animation-slide-right"
      )}
    >
      <div
        className={`bg-${className} border-${className} bg-opacity-25 rounded-1 border-3 m-0 border-start px-3 py-2 shadow`}
        style={{ fontSize: "0.9em" }}
      >
        <span className="opacity-75 d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill d-inline me-1" />
          <span className="text-truncate" title={message}>
            {message}
          </span>
          <button
            className={`bg-transparent border-0 text-${className} ms-auto`}
            onClick={dismiss}
            title="Dismiss"
          >
            <i className="bi bi-x" />
          </button>
        </span>
      </div>
    </li>
  );
};
