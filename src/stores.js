import { writable } from "svelte/store";
import AwaitedQueueProcessor from "./lib/AwaitedQueueProcessor";
import { processAPIAction } from "./lib/utilites";
import { DEFAULT_APP_SETTINGS } from "./lib/defaults";

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const plannedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, 0)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, Tampermonkey.Response<object>>>
 */
export const runningQueue = writable(
  new AwaitedQueueProcessor(async (action, index) => {
    if (!action.retries) {
      action.retries = 0;
    }

    let response;
    try {
      response = await processAPIAction(action);
      finishedQueue.update((prev) => {
        prev.enqueue(action);
        return prev;
      });
    } catch (error) {
      console.log(error);
      action.retries--;

      if (!error.status) {
        try {
          action.error = error + "";
        } catch (_err) {
          action.error = "Error sending request";
        }
      } else {
        switch (error.status) {
          case 409:
            action.error = "Already in room";
            action.retries = -1;
            break;
          case 401:
            action.error = "Token expired, try again";
            break;
        }
      }

      if (action.retries >= 0) {
        runningQueue.update((prev) => {
          prev.enqueue(action);
          return prev;
        });
      } else {
        failedQueue.update((prev) => {
          action.status = "FAILED";

          prev.enqueue(action);
          return prev;
        });
      }
    }

    // Update this list for subscribers
    runningQueue.update((prev) => prev);

    return response;
  }, DEFAULT_APP_SETTINGS.requestWaitSeconds * 1000)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const finishedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, 0)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const failedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, 0)
);

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeRooms>
 */
export const roomList = writable({ rooms: [], loading: false });

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeContacts>
 */
export const contactList = writable({ contacts: [], loading: false });

/**
 * @type import("./types/state").AppSettings | null
 */
let parsedSettings = JSON.parse(GM_getValue("gothamSettings", null));

if (!parsedSettings) {
  parsedSettings = DEFAULT_APP_SETTINGS;
}

// Add missing or new settings to app state
for (let key of Object.keys(DEFAULT_APP_SETTINGS)) {
  if (parsedSettings[key] === undefined) {
    parsedSettings[key] = DEFAULT_APP_SETTINGS[key];
  }
}

// Remove old and invalid keys from app state
for (let key of Object.keys(parsedSettings)) {
  if (DEFAULT_APP_SETTINGS[key] === undefined) {
    delete parsedSettings[key];
  }
}

// Convert JSON-parsed array into set
parsedSettings.autoHideRooms = new Set(parsedSettings.autoHideRooms);

/**
 * @type import("svelte/store").Writable<import("./types/state").AppSettings>
 */
export const settings = writable(parsedSettings);

// Write new settings to local storage
settings.subscribe((newSettings) => {
  GM_setValue("gothamSettings", JSON.stringify(newSettings));
});

// Adjust request wait time if changed
settings.subscribe((updated) => {
  runningQueue.update((prev) => {
    prev.waitms = updated.requestWaitSeconds * 1000;
    return prev;
  });
});
