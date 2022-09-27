/**
 * Odoo buddy
 *
 * @description Adds options to the Odoo backend login screen to login as admin, user or portal in a single click.
 */

(({ odoo, owl }) => {
  if (!odoo) {
    return;
  }

  const isFrontend = [...document.head.querySelectorAll("script")].some((s) =>
    /frontend/.test(s.src)
  );
  const owlVersion = owl ? owl.__info__.version : "not running on Owl";

  let session;
  if ("@web/session" in odoo.__DEBUG__.services) {
    session = odoo.__DEBUG__.services["@web/session"].session;
  } else {
    session = odoo.__DEBUG__.services["web.session"];
  }

  const CONSOLE_STYLE = {
    title:
      "color:#017e84;font-weight:bold;font-family:Roboto;font-size:1.2rem;margin-bottom:0.2rem;",
    default: "color:inherit;font-weight:inherit;font-size:inherit;margin:0;",
    highlight: "color:#ff0080;",
  };

  const infos = [
    `%cRunning in Odoo environment (${isFrontend ? "frontend" : "backend"})%c`,
    `• Database: %c${session.db}%c`,
    `• User ID: %c${session.uid}%c`,
    `• Server version: %c${session.server_version}%c`,
    `• Owl version: %c${owlVersion}%c`,
  ];
  if (odoo.debug) {
    infos.push(`• Debug: %c${odoo.debug}%c`);
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

  if (window.location.pathname !== "/web/login") {
    return;
  }

  const renderTemplate = (node, renderFn) => {
    let nextId = 1;
    let rendering = false;
    let setup = true;
    const registeredGlobalEvents = [];
    const rendererState = {};

    const render = async () => {
      if (rendering) return;
      rendering = true;
      await Promise.resolve();
      const finalizers = [];
      for (const [event, handler] of registeredGlobalEvents) {
        window.removeEventListener(event, handler);
      }
      const helpers = {
        render,
        makeState(state) {
          if (setup) {
            Object.assign(rendererState, state);
          }
          return [
            rendererState,
            async (p, value) => {
              rendererState[p] = value;
              if (!setup) {
                render();
              }
            },
          ];
        },
        on(event, handler, global = false) {
          if (global) {
            window.addEventListener(event, handler);
            registeredGlobalEvents.push([event, handler]);
            return "";
          }
          const attr = `${TRACKER_ATTRIBUTE}="${nextId++}"`;
          finalizers.push(() => {
            const target = node.querySelector(`[${attr}]`);
            target.removeAttribute(TRACKER_ATTRIBUTE);
            target.addEventListener(event, handler);
          });
          return attr;
        },
      };
      node.innerHTML = renderFn(helpers);
      for (const finalizer of finalizers) {
        finalizer();
      }
      rendering = false;
      setup = false;
    };

    return render();
  };

  const STORAGE_KEY = "odoo-buddy-user";
  const TRACKER_ATTRIBUTE = "data-ob-key";
  const loginButtons = document.querySelector(".oe_login_buttons ");
  const btnContainer = document.createElement("div");
  btnContainer.className = "ob-button-container";

  const loginInput = document.querySelector("input[name=login]");
  const pwdInput = document.querySelector("input[name=password]");

  renderTemplate(btnContainer, ({ on, makeState }) => {
    const [state, setState] = makeState({ open: false });
    const [storage, setStorage] = makeState(
      { user: window.localStorage.getItem(STORAGE_KEY) },
      (value) => window.localStorage.setItem(STORAGE_KEY, value)
    );
    if (!storage.user) {
      setStorage("user", "admin");
    }
    const handleSubmit = (user) => {
      return async () => {
        if (user && user !== storage.user) {
          await setStorage("user", user);
        }
        if (user) {
          loginInput.value = pwdInput.value = user;
        }
        btnContainer.closest("form").submit();
      };
    };
    on(
      "click",
      (ev) => {
        if (!ev.target.closest("#ob-toggle")) {
          setState("open", false);
        }
      },
      true
    );
    return /* xml */ `
        <button class="btn btn-primary" ${on("click", handleSubmit())}>
          Log in
        </button>
        <div class="btn-group">
          <button class="btn btn-primary" ${on(
            "click",
            handleSubmit(storage.user)
          )}>
            Log in as ${storage.user}
          </button>
          <button id="ob-toggle" type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" ${on(
            "click",
            () => setState("open", !state.open)
          )} />
          ${
            state.open
              ? /* xml */ `
          <ul class="dropdown-menu show">
            <li class="dropdown-item" ${on("click", handleSubmit("admin"))}>
              <span>Admin</span>
            </li>
            <li class="dropdown-item" ${on("click", handleSubmit("demo"))}>
              <span>Demo</span>
            </li>
            <li class="dropdown-item" ${on("click", handleSubmit("portal"))}>
              <span>Portal</span>
            </li>
          </ul>
          `
              : ""
          }
        </div>`;
  });

  loginButtons.children[0].remove();
  loginButtons.prepend(btnContainer);
})(window.top);
