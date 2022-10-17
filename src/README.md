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
 * My script title
 * A detailed description of my script.
 */
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
 * My non-runnable script
 *
 * @autorun disabled
 */
```

### <a name="directives-image-icon"></a> Image and icon

You can add a [Bootstrap Icon](https://icons.getbootstrap.com/) or an image (local
or URL) to the script. If the image is a local path, the image must be added to
the `JuwuScript/extension/src/img` folder, and the directive value will be the file
name. If both `icon` and `image` are specified, the image will override the icon.

* Default: if [`website`](#directives-website) is specified: the icon of that website will be fetched by default.
* Example:

```js
/**
 * My mouse-related script
 *
 * @icon mouse
 * @image https://www.some-website.com/a-mouse-image.png
 */
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
 * My google and youtube script
 *
 * @pattern (\w+\.)?(google|youtube).com
 */
```

### <a name="directives-requires"></a> Variable requirement

This directive will prevent your script from running if a given variable is not
detected on the current page's window object.

* Default: none
* Example:

```js
/**
 * My someGlobalVar-dependent script
 *
 * @requires someGlobalVar
 */
```

### <a name="directives-website"></a> Website

Restricts your script to a given URL. Note that it only prevents the `autorun` calls
on the given website, you can still [`run`](#directives-autorun-run) it manually (if not disabled).

* Default: none (runs on all websites)
* Example:

```js
/**
 * My github script
 *
 * @website https://github.com/
 */
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
 * My multiple-times-running script
 *
 * @wrapper observer
 */
```
