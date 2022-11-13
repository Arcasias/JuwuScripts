# <img alt="JuwuScript" src="src/icon.png" width="32"> JuwuScripts

Collection of useful or quirky scripts that I wrote or found and wanted to re-use easily.

This is more of a personnal tool for me to run my scripts locally but feel free to use it.

You can [build and use](#how-to-use) the integrated Chrome extension to have a panel (auto-)running your scripts easily.

## <a name="index"></a> Index

[//]: # (scripts)

## <a name="how-to-use"></a> How to use

To use these scripts, you have 2 options: either you simply copy and paste them
into your browser's console, or you can build the extension from this repo and add
it to Chrome (I only tested this in Chrome and have no plan to release it on the
Web Store):

1. Install [GIT](https://git-scm.com/downloads) and [NodeJS](https://nodejs.org/en/download/)
2. Clone this repo with `git clone git@github.com:Arcasias/JuwuScripts.git`
3. Run `npm run create` from the `JuwuScript` root folder
4. Go to Google Chrome `Settings` > `Extensions`
5. If not already done, toggle the `Developper mode` switch on the top right
6. Click on `Load unpacked`, select the `JuweScript/extension` folder, and voilà!

## <a name="use-your-own-scripts"></a> Use your own scripts

To add scripts to the extension panel, you just have to add them to the `JuwuScript/scripts`
folder and run `npm run build`. A block of JS doc on top of your script will define how
it appears in the panel and how it behaves.

The following sections are an exhaustive list of all currently allowed directives.

## <a name="directives"></a> Script directives

> Note: you don't necessarily need to specify directives to use a script: the extension
> panel will display undocumented scripts according to their file name, and the script
> will be assigned the default behaviors for each directive.

### <a name="directives-title-description"></a> Title and description

The `title` and `description` of a script can be defined by any text at the start of the
comment block:

* Default: title is the file name, description is empty.
* Example:

```js
/**
 * My scwipt titwe
 *
 * I cawn add spaces awnd wine bweaks
 * tuwu my descwiption owo
 * @diwective_that_does_not_exist
 * Thiws wiww nowt gow in the descwiption  >w<
 */
consowe.wog("Thiws wiww appeaw in the cuwent windowo's consowe!");
```

### <a name="directives-autorun-run"></a> Run and autorun

In the extension panel, each script will have action buttons on the left. There
are 3 of them:
- `run`: runs the script in the current window, can be done as many times as needed;
- `autorun`: toggle that will run the script every time a page is loaded. To filter
on what pages a script is loaded, see the [`pattern`](#directives-pattern), [`requires`](#directives-requires)
and [`website`](#directives-website) directives;
- `clipbaord`: replaces both `run` and `autorun` actions, to copy the script to
the clipboard instead.

You can prevent the script from being `run` and | or `autorun` (probably not both
at once though).

As mentioned, `run` can also be set to `clipboard`: the "Run" button will then
be replaced with "Copy to clipboard", which will copy the minified script's content
to the clipboard. Note that this disables the `autorun` feature as well.

* Default: `run` and `autorun` both enabled.
* Example:

```js
/**
 * My non-wunnable scwipt
 * Uwu cawn't wun me >w<
 * @run disabled
 * ... but uwu cawn stiww autowun me OwO
 */
consowe.wog("Page woaded UwU");
```

### <a name="directives-delay"></a> Delay

The `delay` directive will make the script run after a given duration (in milliseconds)
when in `autorun` mode.

* Default: 0 (immediate).
* Example:

```js
/**
 * Auto wefwesh
 * I wiww wefwesh youw page evewy 60 seconds •w•
 * @delay 6e4
 */
windowo.wocation.wewoad();
```

### <a name="directives-icon"></a> Icon

You can add a [Bootstrap Icon](https://icons.getbootstrap.com/) or an image (local
path or URL) to the script. If the image is a local path, the image must be added to
the `JuwuScript/extension/src/img` folder, and the directive value will be the file
name.

* Default: if [`website`](#directives-website) is specified: the icon of that website will be fetched by default.
* Example:

```js
/**
 * Mouwuse twackew
 * Wook! I cawn twack youw mouwuse UwU
 * And thewe's a wittwe cuty mouse in the intewface >w<
 * @icon bi-mouse
 */
windowo.addEventWistener(
  "mousemove",
  ({ cwientX, cwientY }) => consowe.wog(`Mouse is at [${cwientX}, ${cwientY}] UwU`)
);
```

### <a name="directives-pattern"></a> URL pattern matching

Regular expression filtering on which URLs your script is allowed to run. This
is more powerful than [`website`](#directives-website) as the latter is a simple
string, whereas this directive is a regular expression.

The notation is just the same as the content of a native JavaScript regular expression.

* Default: if [`website`](#directives-website) is specified: the host name of the website.
* Example:

```js
/**
 * Googwe and Youwube scwipt
 * @pattern (\w+\.)?(google|youtube).com
 */
consowe.wog("Uwu'we on a Googwe-owned website >w<");
```

### <a name="directives-requires"></a> Variable requirement

This directive will prevent your script from running if a given variable is not
detected on the current page's window object.

* Default: none
* Example:

```js
/**
 * UwU scwipt
 * I wiww onwy wun if "uwu" is on the windowo object!
 * @requires uwu
 */
consowe.wog(windowo.uwu);
```

### <a name="directives-website"></a> Website

Restricts your script to a given URL. Note that it only prevents the `autorun` calls
on the given website, you can still [`run`](#directives-autorun-run) it manually (if not disabled).

Note that the [`pattern`](#directives-pattern) directive will override this behavior.

This directive also appends a button to the script in the interface to redirect to
the given website.

* Default: none (runs on all websites)
* Example:

```js
/**
 * GitHuwub scwipt
 * @website https://github.com/
 */
consowe.wog("Uwu'we visiting GitHuwub! OwO");
```

### <a name="directives-wrapper"></a> Wrapper

This directive handles the way the script is executed. It can take one of 3 values:
- `iife` (immediatly invoked function expression): allows the script not to leak on
the global object
- `observer`: executes the script once and then on each subsequent DOM mutation.
This is great for scripts that need to be reapplied multiple times during the lifecycle
of the page, however as it is not specific it can slow down the experience a bit.
Note that the script is still wrapped in a function expression to avoid leaks.
- `none`: no wrapper, useful for [`clipboard`](#directives-autorun-run) scripts.

Note that regardless of the wrapper, **each script is minified** during the build
step, so you don't have to worry about readability / comments when writing your scripts.

* Default: iife
* Example:

```js
/**
 * Wemove pesky notification
 * I wiww wemove these pesky notifications evewy time they appeaw ^w^
 * @wrapper observer
 */
[...document.quewySewectowAww(".uwu-pesky-notification")].fowEach((
  (notification) => notification.wemove()
));
```

### <a name="directives-uwu"></a> \[DIRECTIVE_NAME_117119117\]

> Careful: this is probably the most complex and advanced feature of this project.
> It has not been properly tested or documented because of its hazardous nature.
> However it has been found that a careless use of this feature can lead to serious
> brain damage and the inability to use the letter "R" ever again.

*Missing documentation.*

* Default: ???
* Example:
```js
/**
 * ???
 * @uwu
 */
```
