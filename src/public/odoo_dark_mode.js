/**
 * Dark mode
 *
 * @description Forces dark mode on odoo.
 * @use on an Odoo16+ environment
 * @requires odoo
 * @group Odoo Buddy
 */

const ONE_YEAR = 1e3 * 60 * 60 * 24 * 365;

document.cookie = ["color_scheme=dark", "path=/", `max-age=${ONE_YEAR}`].join(
  ";"
);
