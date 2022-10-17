/**
 * Dark mode
 *
 * Forces dark mode on Odoo (only works in **Odoo16** or higher).
 *
 * @pattern odoo\.com|localhost|\d+.\d+.\d+.\d+:\d+
 * @website https://www.odoo.com
 */

document.cookie = ["color_scheme=dark", "path=/", `max-age=${1e10}`].join(";");
