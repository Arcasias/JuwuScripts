import React, { useState } from "react";

interface ScriptButtonProps extends React.PropsWithChildren {
  title: string;
  url?: string;
  onClick?(): void;
}

export const ScriptButton = ({
  children,
  onClick,
  title,
  url,
}: ScriptButtonProps) => {
  const TagName = url ? "a" : "button";

  const [expanded, setExpanded] = useState(false);

  return (
    <TagName
      href={url}
      target={url && "_blank"}
      rel={url && "noreferrer"}
      className="badge rounded-pill d-flex align-items-center text-bg-secondary text-decoration-none me-2 py-2"
      onClick={() => onClick && onClick()}
      title={url || title}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {expanded && <span className="me-2 animation-slide-right">{title}</span>}
      {children}
    </TagName>
  );
};
