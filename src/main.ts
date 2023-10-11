import App from "./App.svelte";
const componentRootId = "svelte-gotham-root";

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
        console.error("Failed to correctly attach component. Giving up.");
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

export default app;
