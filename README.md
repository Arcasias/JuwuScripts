# Scripts

Collection of useful or quirky scripts that I wrote or found and wanted to re-use easily.

This is more of a personnal tool for me to run my scripts locally but feel free to re-use.

You can [build and use](#chrome-extension) the integrated Chrome extension to have a panel (auto-)running your scripts easily.

## Index

- [Cross-reload timer](#timer)
- [Global scanner](#glob-scanner)
- [Hexadecimal to RGB and vice-versa](#color-operations)
- [Mouse position](#mouse)
- [Netflix & Do nothing](#lazy-netflix)
- [Odoo buddy](#odoo-buddy)
- [Remove YouTube suggestion cards](#youtube-cards)
- [Run away](#runaway)
- [Shana Project 1080p](#shana)
- [Spongebobify](#spongebobify)
- [Storage analyzer](#storage-analyzer)

## How to use

You will first need to open the console (<code style="color:#a8f">F12</code>). Then there are 3 scenarios:

1. The script is <b style="color:#4c4">inline</b> (no <b style="color:#c80">function</b> definition): you can then simply paste the code, press <code style="color:#a8f">Enter</code> and close the console. This should do the trick.
2. The script defines a <b style="color:#c80">function</b> that you can call with the desired <b style="color:#cb0">arguments</b> (there should be enought doc on each script to know what arguments you can use).
3. The script defines something else, which should be specified by the script description.


## <a name="timer">[Cross-reload timer](https://github.com/Arcasias/scripts/blob/master/src/public/timer.js)</a>

This script should be appended where the timer should start, then the timer can be stopped with `timer.stop()` and the results of can be printed with `timer.log()`

- This script defines the function `timer`. You have to call it to see its effects.

```js
(e=>{const a="timer-",l=Date.now();window.timer={stop(){var t=Date.now()-l,o=localStorage.getItem(a+e),o=o?o.split(",").map(Number):[];o.push(t),localStorage.setItem(a+e,o.join(",")),o.length<1e3&&window.top.location.reload()},log(){for(const e in localStorage){var t,o;e.startsWith(a)&&(o=(t=localStorage.getItem(e).split(",").map(Number).sort((t,o)=>t-o)).length/2,console.log(`Results for "${e.slice(a.length)}" on`,t.length,"attempts:"),console.log({max:Math.max(...t),min:Math.min(...t),mean:Math.round(t.reduce((t,o)=>t+o,0)/t.length),median:Math.round(t.length%2?t[Math.floor(o)]:(t[o-1]+t[o])/2)}))}},clear(){for(const t in localStorage)t.startsWith(a)&&localStorage.removeItem(t)}}})("timer");
```


<br>

## <a name="glob-scanner">[Global scanner](https://github.com/Arcasias/scripts/blob/master/src/public/glob_scanner.js)</a>

Scan the `window` object for any additionnal global key.

- This script defines the function `scanGlob`. You have to call it to see its effects.

```js
(i=>{const s="window,self,document,name,location,customElements,history,locationbar,menubar,personalbar,scrollbars,statusbar,toolbar,status,closed,frames,length,top,opener,parent,frameElement,navigator,origin,external,screen,innerWidth,innerHeight,scrollX,pageXOffset,scrollY,pageYOffset,visualViewport,screenX,screenY,outerWidth,outerHeight,devicePixelRatio,clientInformation,screenLeft,screenTop,defaultStatus,defaultstatus,styleMedia,onsearch,isSecureContext,performance,onappinstalled,onbeforeinstallprompt,crypto,indexedDB,webkitStorageInfo,sessionStorage,localStorage,onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended,onerror,onfocus,onformdata,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange,onreset,onresize,onscroll,onseeked,onseeking,onselect,onstalled,onsubmit,onsuspend,ontimeupdate,ontoggle,onvolumechange,onwaiting,onwebkitanimationend,onwebkitanimationiteration,onwebkitanimationstart,onwebkittransitionend,onwheel,onauxclick,ongotpointercapture,onlostpointercapture,onpointerdown,onpointermove,onpointerup,onpointercancel,onpointerover,onpointerout,onpointerenter,onpointerleave,onselectstart,onselectionchange,onanimationend,onanimationiteration,onanimationstart,ontransitionrun,ontransitionstart,ontransitionend,ontransitioncancel,onafterprint,onbeforeprint,onbeforeunload,onhashchange,onlanguagechange,onmessage,onmessageerror,onoffline,ononline,onpagehide,onpageshow,onpopstate,onrejectionhandled,onstorage,onunhandledrejection,onunload,alert,atob,blur,btoa,cancelAnimationFrame,cancelIdleCallback,captureEvents,clearInterval,clearTimeout,close,confirm,createImageBitmap,fetch,find,focus,getComputedStyle,getSelection,matchMedia,moveBy,moveTo,open,postMessage,print,prompt,queueMicrotask,releaseEvents,requestAnimationFrame,requestIdleCallback,resizeBy,resizeTo,scroll,scrollBy,scrollTo,setInterval,setTimeout,stop,webkitCancelAnimationFrame,webkitRequestAnimationFrame,chrome,originAgentCluster,speechSynthesis,onpointerrawupdate,trustedTypes,crossOriginIsolated,openDatabase,webkitRequestFileSystem,webkitResolveLocalFileSystemURL,errorPageController,decodeUTF16Base64ToString,toggleHelpBox,diagnoseErrors,updateForDnsProbe,updateIconClass,search,reloadButtonClick,downloadButtonClick,detailsButtonClick,setAutoFetchState,savePageLaterClick,cancelSavePageClick,toggleErrorInformationPopup,launchOfflineItem,launchDownloadsPage,getIconForSuggestedItem,getSuggestedContentDiv,offlineContentAvailable,toggleOfflineContentListVisibility,onDocumentLoadOrUpdate,onDocumentLoad,onResize,setupMobileNav,Runner,getRandomNum,vibrate,createCanvas,decodeBase64ToArrayBuffer,getTimeStamp,GameOverPanel,checkForCollision,createAdjustedCollisionBox,drawCollisionBoxes,boxCompare,CollisionBox,Obstacle,Trex,DistanceMeter,Cloud,NightMode,HorizonLine,Horizon,loadTimeData,LoadTimeData,jstGetTemplate,JsEvalContext,jstProcess,tp,certificateErrorPageController,res,TEMPORARY,PERSISTENT,addEventListener,dispatchEvent,removeEventListener".split(",");window.scanGlob=(e=[],o=!1)=>{var n=[],t=[...s,...e,"scanGlob"];for(const a in i)t.includes(a)||n.push(a);if(n.length&&(console.warn(`Unregistered global keys (${n.length}): ${n.join(", ")}.`),o))for(const r of n)delete i[r]}})(this);
```


<br>

## <a name="color-operations">[Hexadecimal to RGB and vice-versa](https://github.com/Arcasias/scripts/blob/master/src/public/color_operations.js)</a>

Convert RGB arrays to hexadecimal colors and vice-versa.

- This script defines the functions `hexToRgb` and `rgbToHex`. You have to call them to see their effects.

```js
window.hexToRgb=a=>String(a).match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/)?.slice(1,4).map(a=>parseInt(a,16)),window.rgbToHex=a=>"#"+a.map(a=>Math.floor(a).toString(16).padStart(2,"0")).join("");
```


<br>

## <a name="mouse">[Mouse position](https://github.com/Arcasias/scripts/blob/master/src/public/mouse.js)</a>

Displays the mouse position in real time in the dev tools

- Use: in a new Google Chrome "Live Expression" block

```js
onmousemove?mouse:(window.mouse=[],window.onmousemove=o=>window.mouse=[o.clientX,o.clientY]);
```


<br>

## <a name="lazy-netflix">[Netflix & Do nothing](https://github.com/Arcasias/scripts/blob/master/src/public/lazy_netflix.js)</a>

Automatically click on the `Skip Intro` and `Next Episode` buttons as soon as they appear.

- Works on: https://www.netflix.com/
- Use: after launching any video.

```js
new MutationObserver(()=>[...document.querySelectorAll(".watch-video--skip-content-button,[data-uia=next-episode-seamless-button]")].map(e=>e.click())).observe(document.body,{childList:!0,subtree:!0});
```


<br>

## <a name="odoo-buddy">[Odoo buddy](https://github.com/Arcasias/scripts/blob/master/src/public/odoo_buddy.js)</a>

Adds options to the Odoo backend login screen to login as admin, user or portal in a single click.



```js
(({odoo:e,owl:o})=>{if(!e)return;var n=[...document.head.querySelectorAll("script")].some(e=>/frontend/.test(e.src)),o=o?o.__info__.version:"not running on Owl";let t;const r="color:#017e84;font-weight:bold;font-family:Roboto;font-size:1.2rem;margin-bottom:0.2rem;",s="color:inherit;font-weight:inherit;font-size:inherit;margin:0;",i="color:#ff0080;";var c=[`%cRunning in Odoo environment (${n?"frontend":"backend"})%c`,`• Database: %c${(t="@web/session"in e.__DEBUG__.services?e.__DEBUG__.services["@web/session"].session:e.__DEBUG__.services["web.session"]).db}%c`,`• User ID: %c${t.uid}%c`,`• Server version: %c${t.server_version}%c`,`• Owl version: %c${o}%c`],a=(e.debug&&c.push(`• Debug: %c${e.debug}%c`),[c.join("\n"),r,s]);for(let e=1;e<c.length;e++)a.push(i,s);if(console.debug(...a),"/web/login"!==window.location.pathname)return;const l="odoo-buddy-user",d="data-ob-key";n=document.querySelector(".oe_login_buttons ");const u=document.createElement("div"),m=(u.className="ob-button-container",document.querySelector("input[name=login]")),b=document.querySelector("input[name=password]");{var p=u,w=({on:e,makeState:o})=>{const[n,t]=o({open:!1}),[r,s]=o({user:window.localStorage.getItem(l)},e=>window.localStorage.setItem(l,e));r.user||s("user","admin");o=e=>async()=>{e&&e!==r.user&&await s("user",e),e&&(m.value=b.value=e),u.closest("form").submit()};return e("click",e=>{e.target.closest("#ob-toggle")||t("open",!1)},!0),`
        <button class="btn btn-primary" ${e("click",o())}>
          Log in
        </button>
        <div class="btn-group">
          <button class="btn btn-primary" ${e("click",o(r.user))}>
            Log in as ${r.user}
          </button>
          <button id="ob-toggle" type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" ${e("click",()=>t("open",!n.open))} />
          ${n.open?`
          <ul class="dropdown-menu show">
            <li class="dropdown-item" ${e("click",o("admin"))}>
              <span>Admin</span>
            </li>
            <li class="dropdown-item" ${e("click",o("demo"))}>
              <span>Demo</span>
            </li>
            <li class="dropdown-item" ${e("click",o("portal"))}>
              <span>Portal</span>
            </li>
          </ul>
          `:""}
        </div>`};let s=1,i=!1,c=!0;const g=[],v={},f=async()=>{if(!i){i=!0,await Promise.resolve();const r=[];for(var[e,o]of g)window.removeEventListener(e,o);var n={render:f,makeState(e){return c&&Object.assign(v,e),[v,async(e,o)=>{v[e]=o,c||f()}]},on(o,n,e=!1){if(e)return window.addEventListener(o,n),g.push([o,n]),"";const t=d+`="${s++}"`;return r.push(()=>{var e=p.querySelector(`[${t}]`);e.removeAttribute(d),e.addEventListener(o,n)}),t}};p.innerHTML=w(n);for(const t of r)t();i=!1,c=!1}};f()}n.children[0].remove(),n.prepend(u)})(window.top);
```


<br>

## <a name="youtube-cards">[Remove YouTube suggestion cards](https://github.com/Arcasias/scripts/blob/master/src/public/youtube_cards.js)</a>

Removes the suggestion cards at the end of a video.

- Works on: https://www.youtube.com/
- Use: at the end of a video when the cards appear.

```js
[...document.getElementsByClassName("ytp-ce-element")].map(e=>e.remove());
```


<br>

## <a name="runaway">[Run away](https://github.com/Arcasias/scripts/blob/master/src/public/runaway.js)</a>

Makes the interactive elements go crazy!



```js
(()=>{let c=!1;window.addEventListener("mousemove",async t=>{if(!c){c=!0;var{clientX:e,clientY:i}=[t][0];for(const l of document.querySelectorAll('a[href],button,input,select,[tabindex]:not([tabindex="-1"]')){var n,o,{x:a,y:s,height:r,width:d}=l.getBoundingClientRect();d&&r&&(n=a+d/2-e,o=s+r/2-i,Math.sqrt(n**2+o**2)<Math.max(100,d+20,r+20)&&Object.assign(l.style,{position:"fixed",width:d+"px",height:r+"px",left:a+n+"px",top:s+o+"px"}))}await new Promise(requestAnimationFrame),c=!1}},!0)})();
```


<br>

## <a name="shana">[Shana Project 1080p](https://github.com/Arcasias/scripts/blob/master/src/public/shana.js)</a>

Filter the search results to only have 1080p links.

- Works on: https://www.shanaproject.com/
- Use: after searching for any anime

```js
[...document.getElementsByClassName("release_block")].map(e=>!/1080p/.test(e.innerText)&&e.remove()).length;
```


<br>

## <a name="spongebobify">[Spongebobify](https://github.com/Arcasias/scripts/blob/master/src/public/spongebobify.js)</a>

Time to sPonGeBobIfY your texts!

- This script defines the function `spongebobify`. You have to call it to see its effects.

```js
window.spongebobify=o=>o.split("").map(o=>.5<Math.random()?o.toLowerCase():o.toUpperCase()).join("");
```


<br>

## <a name="storage-analyzer">[Storage analyzer](https://github.com/Arcasias/scripts/blob/master/src/public/storage_analyzer.js)</a>

Get the size and content of the local/session storages.

- Use: on any website

```js
(()=>{var e="Arial";const t=e=>Math.floor(255*e).toString(16).padStart(2,"0"),c=(e,o=!0)=>{let t="",n="";o=o?"%c":"";return 1e9<e?(n=(e/2**30).toFixed(2),t="G"):1e6<e?(n=(e/2**20).toFixed(2),t="M"):1e3<e?(n=(e/1024).toFixed(2),t="K"):n=e,o+n+o+` ${t}B`};for(const s of["localStorage","sessionStorage"]){window[s]||Object.defineProperty(window,s,(i=s,o=void 0,o=document.createElement("iframe"),document.head.append(o),i=Object.getOwnPropertyDescriptor(o.contentWindow,i),o.remove(),i));let n=0,r=0;var o=Object.entries(window[s]),i=o.map(([e,o])=>{var t=(new TextEncoder).encode(e).length,o=(new TextEncoder).encode(o).length;return n+=t,r+=o,[e,t+o]}).sort((e,o)=>o[1]-e[1]).reduce((e,o)=>Object.assign(e,{[o[0]]:""+c(o[1],!1)}),{}),a=n+r,d=`font-family:${e};color:inherit;`,l=`font-family:${e};color:${((e,o)=>{o/=2;return"#"+[Math.min(e/o,1),1-Math.min(Math.max(e-o,0)/o,1),0].map(t).join("")})(a,512e4)};`;console.log([`%cwindow.${s}%c :`,`%c- Size: ${c(a)} (keys: ${c(n)} / values: ${c(r)})`,`%c- Keys: %c${o.length}%c`].join("\n"),"font-family:Consolas;color:#d020f0;",d,d,l,d,l,d,l,d,d,l,d,i)}})();
```



## <a name="chrome-extension"></a> Chrome extension

I only tested this in Chrome and have no plan to release it on the Web Store.

1. Step into the `./extension` folder
2. Run `npm run build`
3. Go to Google Chrome `Settings` > `Extensions`
4. If not already done, toggle the `Developper mode` switch on the top right
5. Click on `Load unpacked`, select the `./extension/build` folder that was created in step 1
