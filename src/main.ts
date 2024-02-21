import App from "./App.svelte";
import { logger } from "./loggerStore";
const componentRootId = "svelte-gotham-root";
import { version } from "../package.json";

// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browsers#answer-26358856
function detectBrowser() {
  const ua = navigator.userAgent;
  if ((ua.indexOf("Opera") || ua.indexOf("OPR")) != -1) {
    return "Opera";
  }
  if (ua.indexOf("Edg") != -1) {
    return "Edge";
  }
  if (ua.indexOf("Chrome") != -1) {
    return "Chrome";
  }
  if (ua.indexOf("Safari") != -1) {
    return "Safari";
  }
  if (ua.indexOf("Firefox") != -1) {
    return "Firefox";
  }
  // @ts-ignore
  if (ua.indexOf("MSIE") != -1 || !!document.documentMode == true) {
    //IF IE > 10
    return "Internet Explorer";
  } else {
    return "unknown";
  }
}

logger.update((log) => {
  log.debug(`Gotham v${version} started in ${detectBrowser()} browser`);
  return log;
});

const target = document.createElement("div");
const app = new App({
  target,
  props: {
    rootId: componentRootId,
  },
});

// Check if top bar was re-rendered, reattach target if necessary
let MAX_RETRIES = 1000;
let retries = 0;
const bodyObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.target) {
      const topBar = document.querySelector(".ChatContainer__top.webContainer");

      // Check if the top bar is mounted
      if (!topBar) {
        return;
      }

      // Checking retry count
      if (retries >= MAX_RETRIES) {
        logger.update((log) => {
          log.fatal(
            `Failed to correctly attach component to the DOM after ${MAX_RETRIES} attempts. Giving up.`
          );
          return log;
        });
        return;
      }

      // Check if target is attached to top bar, append if not
      const targetQuery = document.querySelector(`#${componentRootId}`);
      if (!targetQuery) {
        topBar.appendChild(target);

        // Since appending causes a new mutation, increment retries to avoid infinite loop
        retries++;
      } else {
        // target is attached, reset retries
        retries = 0;
      }
    }
  });
});

bodyObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

// https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript/52809105#52809105
(() => {
  let oldPushState = history.pushState;
  history.pushState = function pushState() {
    let ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  let oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    let ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
})();

export default app;
