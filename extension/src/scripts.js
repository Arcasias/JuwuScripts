export const SCRIPTS = [
  {"content":`(()=>{{var e="timer";const a="timer-",l=Date.now();window.timer={stop(){var t=Date.now()-l,o=localStorage.getItem(a+e),o=o?o.split(",").map(Number):[];o.push(t),localStorage.setItem(a+e,o.join(",")),o.length<1e3&&window.top.location.reload()},log(){for(const e in localStorage){var t,o;e.startsWith(a)&&(o=(t=localStorage.getItem(e).split(",").map(Number).sort((t,o)=>t-o)).length/2,console.log(\`Results for "\${e.slice(a.length)}" on\`,t.length,"attempts:"),console.log({max:Math.max(...t),min:Math.min(...t),mean:Math.round(t.reduce((t,o)=>t+o,0)/t.length),median:Math.round(t.length%2?t[Math.floor(o)]:(t[o-1]+t[o])/2)}))}},clear(){for(const t in localStorage)t.startsWith(a)&&localStorage.removeItem(t)}}}})();`,"directives":{"wrapper":`iife`,"description":`This script should be appended where the timer should start, then the timer can be stopped with \`timer.stop()\` and the results of can be printed with \`timer.log()\``,"result":[`timer`]},"ext":`js`,"fileName":`timer.js`,"id":`timer`,"title":`Cross-reload timer`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/timer.js`},{"content":`(()=>{const i="window,self,document,name,location,customElements,history,locationbar,menubar,personalbar,scrollbars,statusbar,toolbar,status,closed,frames,length,top,opener,parent,frameElement,navigator,origin,external,screen,innerWidth,innerHeight,scrollX,pageXOffset,scrollY,pageYOffset,visualViewport,screenX,screenY,outerWidth,outerHeight,devicePixelRatio,clientInformation,screenLeft,screenTop,defaultStatus,defaultstatus,styleMedia,onsearch,isSecureContext,performance,onappinstalled,onbeforeinstallprompt,crypto,indexedDB,webkitStorageInfo,sessionStorage,localStorage,onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended,onerror,onfocus,onformdata,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange,onreset,onresize,onscroll,onseeked,onseeking,onselect,onstalled,onsubmit,onsuspend,ontimeupdate,ontoggle,onvolumechange,onwaiting,onwebkitanimationend,onwebkitanimationiteration,onwebkitanimationstart,onwebkittransitionend,onwheel,onauxclick,ongotpointercapture,onlostpointercapture,onpointerdown,onpointermove,onpointerup,onpointercancel,onpointerover,onpointerout,onpointerenter,onpointerleave,onselectstart,onselectionchange,onanimationend,onanimationiteration,onanimationstart,ontransitionrun,ontransitionstart,ontransitionend,ontransitioncancel,onafterprint,onbeforeprint,onbeforeunload,onhashchange,onlanguagechange,onmessage,onmessageerror,onoffline,ononline,onpagehide,onpageshow,onpopstate,onrejectionhandled,onstorage,onunhandledrejection,onunload,alert,atob,blur,btoa,cancelAnimationFrame,cancelIdleCallback,captureEvents,clearInterval,clearTimeout,close,confirm,createImageBitmap,fetch,find,focus,getComputedStyle,getSelection,matchMedia,moveBy,moveTo,open,postMessage,print,prompt,queueMicrotask,releaseEvents,requestAnimationFrame,requestIdleCallback,resizeBy,resizeTo,scroll,scrollBy,scrollTo,setInterval,setTimeout,stop,webkitCancelAnimationFrame,webkitRequestAnimationFrame,chrome,originAgentCluster,speechSynthesis,onpointerrawupdate,trustedTypes,crossOriginIsolated,openDatabase,webkitRequestFileSystem,webkitResolveLocalFileSystemURL,errorPageController,decodeUTF16Base64ToString,toggleHelpBox,diagnoseErrors,updateForDnsProbe,updateIconClass,search,reloadButtonClick,downloadButtonClick,detailsButtonClick,setAutoFetchState,savePageLaterClick,cancelSavePageClick,toggleErrorInformationPopup,launchOfflineItem,launchDownloadsPage,getIconForSuggestedItem,getSuggestedContentDiv,offlineContentAvailable,toggleOfflineContentListVisibility,onDocumentLoadOrUpdate,onDocumentLoad,onResize,setupMobileNav,Runner,getRandomNum,vibrate,createCanvas,decodeBase64ToArrayBuffer,getTimeStamp,GameOverPanel,checkForCollision,createAdjustedCollisionBox,drawCollisionBoxes,boxCompare,CollisionBox,Obstacle,Trex,DistanceMeter,Cloud,NightMode,HorizonLine,Horizon,loadTimeData,LoadTimeData,jstGetTemplate,JsEvalContext,jstProcess,tp,certificateErrorPageController,res,TEMPORARY,PERSISTENT,addEventListener,dispatchEvent,removeEventListener".split(",");window.scanGlob=(e=[],o=!1)=>{var n=[],t=[...i,...e,"scanGlob"];for(const a in window)t.includes(a)||n.push(a);if(n.length&&(console.warn(\`Unregistered global keys (\${n.length}): \${n.join(", ")}.\`),o))for(const r of n)delete window[r]}})();`,"directives":{"wrapper":`iife`,"description":`Scan the \`window\` object for any additionnal global key.`,"result":[`scanGlob`]},"ext":`js`,"fileName":`glob_scanner.js`,"id":`glob-scanner`,"title":`Global scanner`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/glob_scanner.js`},{"content":`window.hexToRgb=a=>String(a).match(/#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})/)?.slice(1,4).map(a=>parseInt(a,16)),window.rgbToHex=a=>"#"+a.map(a=>Math.floor(a).toString(16).padStart(2,"0")).join("");`,"directives":{"wrapper":`iife`,"description":`Convert RGB arrays to hexadecimal colors and vice-versa.`,"result":[`hexToRgb`,`rgbToHex`]},"ext":`js`,"fileName":`color_operations.js`,"id":`color-operations`,"title":`Hexadecimal to RGB and vice-versa`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/color_operations.js`},{"content":`onmousemove?mouse:(window.mouse=[],window.onmousemove=o=>window.mouse=[o.clientX,o.clientY]);`,"directives":{"wrapper":`none`,"description":`Displays the mouse position in real time in the dev tools`,"use":`in a new Google Chrome "Live Expression" block`},"ext":`js`,"fileName":`mouse.js`,"id":`mouse`,"title":`Mouse position`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/mouse.js`},{"content":`(()=>{var e=()=>{[...document.querySelectorAll(".watch-video--skip-content-button,[data-uia=next-episode-seamless-button]")].forEach(e=>e.click())};new MutationObserver(e).observe(document.body,{childList:!0,subtree:!0}),e()})();`,"directives":{"wrapper":`observer`,"description":`Automatically click on the \`Skip Intro\` and \`Next Episode\` buttons as soon as they appear.`,"website":`https://www.netflix.com/`},"ext":`js`,"fileName":`lazy_netflix.js`,"id":`lazy-netflix`,"title":`Netflix & Do nothing`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/lazy_netflix.js`},{"content":`(()=>{if(!window.odoo)return;const{odoo:e,owl:o}=window;let t;t="@web/session"in e.__DEBUG__.services?e.__DEBUG__.services["@web/session"].session:e.__DEBUG__.services["web.session"],Object.defineProperty(e,"session",{get(){return t}});const n="color:#017e84;font-weight:bold;font-family:Roboto;font-size:1.2rem;margin-bottom:0.2rem;",s="color:#aab;font-weight:inherit;font-family:Roboto;font-size:inherit;margin:0;margin-bottom:0.1rem;",r="color:#98f;";var i,l=[\`%cOdoo \${[...document.head.querySelectorAll("script")].some(e=>/frontend/.test(e.src))?"frontend":"backend"} environment%c\`];if(t.db&&(w=(i=t.server_version||"")?\` (\${i.endsWith("e")?"enterprise":"community"})\`:"",l.push(\`• Database : %c\${t.db+w}%c\`,\`• Server version : %c\${i}%c\`)),o){const \$=({component:e,children:o})=>({[e.constructor.name]:e,children:Object.values(o).map(\$)});Object.defineProperty(o,"root",{get(){if(e.__WOWL_DEBUG__)return \$(e.__WOWL_DEBUG__.root.__owl__);throw new Error("Root not instantiated yet.")}}),l.push(\`• Owl version : %c\${o.__info__.version}%c\`)}e.debug&&l.push(\`• Debug mode : %c\${e.debug}%c\`);var c=[l.join("\\n"),n,s];for(let e=1;e<l.length;e++)c.push(r,s);if(console.debug(...c),"/web/login"!==window.location.pathname)return;const a=e=>{e=Boolean(e.target.closest("#ob-toggle"));e!==h.open&&(h.open=e,d())},d=()=>{for(_.innerHTML=\`
      <button class="btn btn-primary me-2" style="flex:1" \${m()}>
        Log in
      </button>
      <div class="btn-group" style="flex:2.5">
        <button class="btn btn-primary" \${m(h.user)}>
          Log in as \${h.user}
        </button>
        <button id="ob-toggle" type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" />
        \${h.open?\`
        <ul class="dropdown-menu show">
          <li class="dropdown-item" \${m("admin")}>
            <span>Admin</span>
          </li>
          <li class="dropdown-item" \${m("demo")}>
            <span>Demo</span>
          </li>
          <li class="dropdown-item" \${m("portal")}>
            <span>Portal</span>
          </li>
        </ul>
        \`:""}
      </div>\`;v.length;)v.pop()()},u=e=>{e!==h.user&&(h.user=e,g.value=f.value=e,window.localStorage.setItem(b,e),d())},m=o=>{const t=p+\`="\${y++}"\`;return v.push(()=>{var e=_.querySelector(\`[\${t}]\`);e.removeAttribute(p),e.addEventListener("click",()=>{o&&u(o),_.closest("form").submit()})}),t},b=(customElements.define("ob-buttons",class extends HTMLElement{connectedCallback(){window.addEventListener("click",a,!0)}disconnectedCallback(){window.removeEventListener("click",a,!0)}}),"odoo-buddy-user"),p="data-ob-key";var w=document.querySelector(".oe_login_buttons ");const _=new(customElements.get("ob-buttons")),g=(_.setAttribute("class","d-flex"),document.querySelector("input[name=login]")),f=document.querySelector("input[name=password]"),v=[],h={open:!1,user:window.localStorage.getItem(b)};let y=1;h.user?d():u("admin"),w.children[0].remove(),w.prepend(_)})();`,"directives":{"wrapper":`iife`,"description":`Adds options to the Odoo backend login screen to login as admin, user or portal in a single click.`,"use":`on any Odoo environment.`},"ext":`js`,"fileName":`odoo_buddy.js`,"id":`odoo-buddy`,"title":`Odoo buddy`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/odoo_buddy.js`},{"content":`(()=>{var e=()=>{[...document.querySelectorAll(".ytp-ce-element")].map(e=>e.remove())};new MutationObserver(e).observe(document.body,{childList:!0,subtree:!0}),e()})();`,"directives":{"wrapper":`observer`,"description":`Removes the suggestion cards at the end of a video.`,"website":`https://www.youtube.com/`},"ext":`js`,"fileName":`youtube_cards.js`,"id":`youtube-cards`,"title":`Remove YouTube suggestion cards`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/youtube_cards.js`},{"content":`(async()=>{let l=!1;window.addEventListener("mousemove",async t=>{if(!l){l=!0;var{clientX:e,clientY:i}=[t][0];for(const d of document.querySelectorAll('a[href],button,input,select,[tabindex]:not([tabindex="-1"]')){var n,a,{x:o,y:s,height:r,width:c}=d.getBoundingClientRect();c&&r&&(n=o+c/2-e,a=s+r/2-i,Math.sqrt(n**2+a**2)<Math.max(100,c+20,r+20)&&Object.assign(d.style,{position:"fixed",width:c+"px",height:r+"px",left:o+n+"px",top:s+a+"px"}))}await new Promise(requestAnimationFrame),l=!1}},!0)})();`,"directives":{"wrapper":`iife`,"description":`Makes the interactive elements go crazy!`},"ext":`js`,"fileName":`runaway.js`,"id":`runaway`,"title":`Run away`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/runaway.js`},{"content":`(()=>{var e=()=>{[...document.getElementsByClassName("release_block")].forEach(e=>!/1080p/.test(e.innerText)&&e.remove())};new MutationObserver(e).observe(document.body,{childList:!0,subtree:!0}),e()})();`,"directives":{"wrapper":`observer`,"description":`Filter the search results to only have 1080p links.`,"website":`https://www.shanaproject.com/`},"ext":`js`,"fileName":`shana.js`,"id":`shana`,"title":`Shana Project 1080p`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/shana.js`},{"content":`window.spongebobify=o=>{o=o.split("").map(o=>.5<Math.random()?o.toLowerCase():o.toUpperCase()).join("");return navigator.clipboard.writeText(o).catch(console.debug),o};`,"directives":{"wrapper":`iife`,"description":`Time to sPonGeBobIfY your texts!`,"result":[`spongebobify`]},"ext":`js`,"fileName":`spongebobify.js`,"id":`spongebobify`,"title":`Spongebobify`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/spongebobify.js`},{"content":`(()=>{var e="Arial";const t=e=>Math.floor(255*e).toString(16).padStart(2,"0"),c=(e,o=!0)=>{let t="",n="";o=o?"%c":"";return 1e9<e?(n=(e/2**30).toFixed(2),t="G"):1e6<e?(n=(e/2**20).toFixed(2),t="M"):1e3<e?(n=(e/1024).toFixed(2),t="K"):n=e,o+n+o+\` \${t}B\`};for(const s of["localStorage","sessionStorage"]){window[s]||Object.defineProperty(window,s,(i=s,o=void 0,o=document.createElement("iframe"),document.head.append(o),i=Object.getOwnPropertyDescriptor(o.contentWindow,i),o.remove(),i));let n=0,r=0;var o=Object.entries(window[s]),i=o.map(([e,o])=>{var t=(new TextEncoder).encode(e).length,o=(new TextEncoder).encode(o).length;return n+=t,r+=o,[e,t+o]}).sort((e,o)=>o[1]-e[1]).reduce((e,o)=>Object.assign(e,{[o[0]]:""+c(o[1],!1)}),{}),a=n+r,d=\`font-family:\${e};color:inherit;\`,l=\`font-family:\${e};color:\${((e,o)=>{o/=2;return"#"+[Math.min(e/o,1),1-Math.min(Math.max(e-o,0)/o,1),0].map(t).join("")})(a,512e4)};\`;console.log([\`%cwindow.\${s}%c :\`,\`%c- Size: \${c(a)} (keys: \${c(n)} / values: \${c(r)})\`,\`%c- Keys: %c\${o.length}%c\`].join("\\n"),"font-family:Consolas;color:#d020f0;",d,d,l,d,l,d,l,d,d,l,d,i)}})();`,"directives":{"wrapper":`iife`,"description":`Get the size and content of the local/session storages.`},"ext":`js`,"fileName":`storage_analyzer.js`,"id":`storage-analyzer`,"title":`Storage analyzer`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/storage_analyzer.js`},{"content":`Storage.prototype.setItem=e=>{console.debug(\`Storage: prevented "\${e}" from being added.\`)};for(const b of[window.localStorage,window.sessionStorage])b.clear();`,"directives":{"wrapper":`iife`,"description":`Clean local and session storages and prevent them from being used.`},"ext":`js`,"fileName":`storage_cleaner.js`,"id":`storage-cleaner`,"title":`Storage cleaner`,"url":`https://github.com/Arcasias/scripts/blob/master/src/public/storage_cleaner.js`}
];
