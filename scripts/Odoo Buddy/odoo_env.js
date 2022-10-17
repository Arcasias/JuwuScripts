/**
 * Odoo Environment
 *
 * Logs several informations about the current Odoo environment, and adds `odoo.session`
 * and `owl.root` variables accessible from the global scope.
 *
 * @pattern odoo\.com|localhost|\d+.\d+.\d+.\d+:\d+
 * @requires odoo
 * @website https://www.odoo.com
 */

const { odoo, owl, location } = window;

// Console infos + getters
if (!odoo.__OB_PATCH__) {
  const defineGetterOnce = (obj, prop, get) => {
    if (!Object.getOwnPropertyDescriptor(obj, prop)) {
      Object.defineProperty(obj, prop, { get });
    }
  };

  defineGetterOnce(odoo, "__OB_PATCH__", () => true);

  let session;
  if ("@web/session" in odoo.__DEBUG__.services) {
    session = odoo.__DEBUG__.services["@web/session"].session;
  } else {
    session = odoo.__DEBUG__.services["web.session"];
  }

  defineGetterOnce(odoo, "session", () => session);

  const isFrontend = [...document.head.querySelectorAll("script")].some((s) =>
    /frontend/.test(s.src)
  );

  const CONSOLE_STYLE = {
    title:
      "color:#017e84;font-weight:bold;font-family:Roboto;font-size:1.2rem;margin-bottom:0.2rem;",
    default:
      "color:#aab;font-weight:inherit;font-family:Roboto;font-size:inherit;margin:0;margin-bottom:0.1rem;",
    highlight: "color:#98f;",
  };

  const infos = [`%cOdoo ${isFrontend ? "frontend" : "backend"} environment%c`];

  if (session.db) {
    const serverVersion = session.server_version || "";
    const servEnv = serverVersion
      ? ` (${serverVersion.endsWith("e") ? "enterprise" : "community"})`
      : "";
    infos.push(
      `• Database : %c${session.db + servEnv}%c`,
      `• Server version : %c${serverVersion}%c`
    );
  }

  if (owl) {
    const getComponents = ({ component, children }) => ({
      [component.constructor.name]: component,
      children: Object.values(children).map(getComponents),
    });
    defineGetterOnce(owl, "root", () => {
      if (!odoo.__WOWL_DEBUG__) {
        throw new Error("Root not instantiated yet.");
      }
      return getComponents(odoo.__WOWL_DEBUG__.root.__owl__);
    });
    infos.push(`• Owl version : %c${owl.__info__.version}%c`);
  }

  if (odoo.debug) {
    infos.push(`• Debug mode : %c${odoo.debug}%c`);
  }

  const debugArgs = [
    infos.join("\n"),
    CONSOLE_STYLE.title,
    CONSOLE_STYLE.default,
  ];
  for (let i = 1; i < infos.length; i++) {
    debugArgs.push(CONSOLE_STYLE.highlight, CONSOLE_STYLE.default);
  }

  console.debug(...debugArgs);
}
