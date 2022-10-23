import React, { useContext, useMemo } from "react";
import { TabContext } from "../providers/TabProvider";
import { ThemeContext } from "../providers/ThemeProvider";
import { TranslationContext } from "../providers/TranslationProvider";
import { ScriptInfo } from "../scripts";
import { canScriptRun, getClass, getId, plural } from "../utils/utils";

import "./Group.scss";

export interface ScriptGroup {
  name: string;
  scripts: ScriptInfo[];
}

export interface ScriptGroupProps extends React.PropsWithChildren {
  autorun: Record<string, boolean>;
  group: ScriptGroup;
  open: boolean;
  toggleOpen(): void;
}

export const Group = ({
  autorun,
  children,
  group,
  open,
  toggleOpen,
}: ScriptGroupProps) => {
  const displayNumbers = () =>
    [
      idle > 0 && (
        <span
          key="idle"
          className={theme.is("light") ? "text-dark" : "text-light"}
        >
          {idle}
        </span>
      ),
      running > 0 && (
        <span key="running" className="text-info">
          {running}
        </span>
      ),
      disabled > 0 && (
        <span key="disabled" className="text-muted">
          {disabled}
        </span>
      ),
    ].filter(Boolean) as (JSX.Element | JSX.Element[])[];

  const tab = useContext(TabContext);
  const theme = useContext(ThemeContext);
  const t = useContext(TranslationContext);

  const [idle, running, disabled, title] = useMemo(() => {
    let idle = 0;
    let running = 0;
    let disabled = 0;
    for (const script of group.scripts) {
      if (!canScriptRun(script, tab)) {
        disabled++;
      } else if (autorun[getId(script)]) {
        running++;
      } else {
        idle++;
      }
    }

    const titleParts = [];
    if (idle > 0) {
      titleParts.push(`${idle} idle ${plural("script", idle)}`);
    }
    if (running > 0) {
      titleParts.push(`${running} ${plural("script", running)} autorunning`);
    }
    if (disabled > 0) {
      titleParts.push(`${disabled} ${plural("script", disabled)} disabled`);
    }

    const title = `${group.name}: ${titleParts.join(", ")}`;

    return [idle, running, disabled, title];
  }, [tab, group, autorun]);

  return (
    <React.Fragment key={group.name}>
      <h6
        className={getClass(
          theme.className,
          "script-group-name text-secondary list-group-item user-select-none ps-2 m-0 border-0 d-flex animation-slide-right"
        )}
        onClick={toggleOpen}
        onKeyDown={(ev) => ev.key === "Enter" && toggleOpen()}
        title={t(title)}
        tabIndex={0}
      >
        <span className="me-2">
          <i className="bi bi-folder-fill" />
        </span>
        <span>{t(group.name)}</span>
        <span className="ms-1 opacity-50">
          (
          {displayNumbers().reduce((prev: any, curr: any) => [
            prev,
            " - ",
            curr,
          ])}
          )
        </span>
        <span
          className={getClass(
            "ms-auto script-group-caret d-flex align-items-center",
            open && "upside-down"
          )}
        >
          <i className="bi bi-caret-down-fill" />
        </span>
      </h6>
      {open && <div className="animation-slide-down">{children}</div>}
    </React.Fragment>
  );
};
