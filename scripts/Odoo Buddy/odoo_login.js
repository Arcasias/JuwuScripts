/**
 * Auto login
 *
 * Adds options to the Odoo backend login screen to log in as admin, user or portal
 * in a single click.
 *
 * @icon https://www.odoo.com/favicon.ico
 * @pattern runbot\d+\.odoo\.com|localhost|\d+.\d+.\d+.\d+:\d+
 * @requires odoo
 */

const { odoo, location } = window;

// Login page
if (
  location.pathname === "/web/login" &&
  !/(www|runbot)\.odoo\.com/.test(location.hostname)
) {
  const onWindowClick = (ev) => {
    setOpen(Boolean(ev.target.closest("#ob-toggle")));
  };

  const render = () => {
    btnContainer.innerHTML = renderTemplate();
    while (renderFinalizers.length) {
      renderFinalizers.pop()();
    }
  };

  const renderTemplate = () => /* xml */ `
    <button class="btn btn-primary mr-2 me-2" style="flex:1" ${submitHandler()}>
      Log in
    </button>
    <div class="btn-group" style="flex:2.5">
      <button class="btn btn-primary" ${submitHandler(state.user)}>
        Log in as ${state.user}
      </button>
      <button id="ob-toggle" type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" />
      ${
        state.open
          ? /* xml */ `
      <ul class="dropdown-menu show">
        <li class="dropdown-item" ${submitHandler("admin")}>
          <span>Admin</span>
        </li>
        <li class="dropdown-item" ${submitHandler("demo")}>
          <span>Demo</span>
        </li>
        <li class="dropdown-item" ${submitHandler("portal")}>
          <span>Portal</span>
        </li>
      </ul>
      `
          : ""
      }
    </div>`;

  const setOpen = (open) => {
    if (open !== state.open) {
      state.open = open;
      render();
    }
  };

  const setUser = (user) => {
    if (user !== state.user) {
      state.user = user;
      window.localStorage.setItem(STORAGE_KEY, user);
      render();
    }
    loginInput.value = pwdInput.value = user;
  };

  const submitHandler = (user) => {
    const attr = `${TRACKER_ATTRIBUTE}="${nextId++}"`;
    renderFinalizers.push(() => {
      const target = btnContainer.querySelector(`[${attr}]`);
      target.removeAttribute(TRACKER_ATTRIBUTE);
      target.addEventListener("click", () => {
        if (user) {
          setUser(user);
        }

        form.submit();
      });
    });
    return attr;
  };

  customElements.define(
    "ob-buttons",
    class OdooBuddyButtons extends HTMLElement {
      connectedCallback() {
        window.addEventListener("click", onWindowClick, true);
      }

      disconnectedCallback() {
        window.removeEventListener("click", onWindowClick, true);
      }
    }
  );

  const STORAGE_KEY = "odoo-buddy-user";
  const TRACKER_ATTRIBUTE = "data-ob-key";
  const loginButtons = document.querySelector(".oe_login_buttons ");
  const btnContainer = new (customElements.get("ob-buttons"))();
  btnContainer.setAttribute("class", "d-flex");

  const loginInput = document.querySelector("input[name=login]");
  loginInput.value = "";
  const pwdInput = document.querySelector("input[name=password]");
  pwdInput.value = "";
  const form = loginInput.closest("form");
  for (const el of [loginInput, pwdInput, form]) {
    el.setAttribute("autocomplete", "off");
  }

  const renderFinalizers = [];
  const state = {
    open: false,
    user: window.localStorage.getItem(STORAGE_KEY),
  };
  let nextId = 1;

  if (state.user) {
    render();
  } else {
    setUser("admin");
  }

  loginButtons.children[0].remove();
  loginButtons.prepend(btnContainer);
}
