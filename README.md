# JuwuScripts

Collection of useful or quirky scripts that I wrote or found and wanted to re-use easily.

This is more of a personnal tool for me to run my scripts locally but feel free to re-use.

You can [build and use](#chrome-extension) the integrated Chrome extension to have a panel (auto-)running your scripts easily.

## <a name="index"></a> Index

- [Auto login](https://github.com/Arcasias/scripts/blob/master/src/Odoo Buddy/odoo_login.js)
- [Cross-reload timer](https://github.com/Arcasias/scripts/blob/master/src/timer.js)
- [Dark mode](https://github.com/Arcasias/scripts/blob/master/src/Odoo Buddy/odoo_dark_mode.js)
- [Environment](https://github.com/Arcasias/scripts/blob/master/src/Odoo Buddy/odoo_env.js)
- [Global scanner](https://github.com/Arcasias/scripts/blob/master/src/glob_scanner.js)
- [Hexadecimal to RGB and vice-versa](https://github.com/Arcasias/scripts/blob/master/src/color_operations.js)
- [Mouse position](https://github.com/Arcasias/scripts/blob/master/src/mouse.js)
- [Netflix & Do nothing](https://github.com/Arcasias/scripts/blob/master/src/lazy_netflix.js)
- [Run away](https://github.com/Arcasias/scripts/blob/master/src/runaway.js)
- [Remove YouTube suggestion cards](https://github.com/Arcasias/scripts/blob/master/src/youtube_cards.js)
- [Shana Project 1080p](https://github.com/Arcasias/scripts/blob/master/src/shana.js)
- [Spongebobify](https://github.com/Arcasias/scripts/blob/master/src/spongebobify.js)
- [Storage analyzer](https://github.com/Arcasias/scripts/blob/master/src/Storage/storage_analyzer.js)
- [Storage cleaner](https://github.com/Arcasias/scripts/blob/master/src/Storage/storage_cleaner.js)

## <a name="how-to-use"></a> How to use

You will first need to open the console (<code style="color:#a8f">F12</code>). Then there are 3 scenarios:

1. The script is <b style="color:#4c4">inline</b> (no <b style="color:#c80">function</b> definition): you can then simply paste the code, press <code style="color:#a8f">Enter</code> and close the console. This should do the trick.
2. The script defines a <b style="color:#c80">function</b> that you can call with the desired <b style="color:#cb0">arguments</b> (there should be enought doc on each script to know what arguments you can use).
3. The script defines something else, which should be specified by the script description.

## <a name="chrome-extension"></a> Chrome extension

I only tested this in Chrome and have no plan to release it on the Web Store.

1. Step into the `./extension` folder
2. Run `npm run build`
3. Go to Google Chrome `Settings` > `Extensions`
4. If not already done, toggle the `Developper mode` switch on the top right
5. Click on `Load unpacked`, select the `./extension` folder that was created in step 1
