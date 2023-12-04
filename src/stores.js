import { writable } from "svelte/store";
import AwaitedQueueProcessor from "./lib/AwaitedQueueProcessor";
import { processAPIAction } from "./lib/utilites";

const API_WAIT_TIME_MS = 1000;

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

      let errorMessage = "";

      if (!error.status) {
        try {
          errorMessage = error + "";
        } catch (_err) {
          errorMessage = "Error sending request";
        }
      } else {
        switch (error.status) {
          case 409:
            errorMessage = "Already in room";
            action.retries = -1;
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

          let requestError = {
            ...action,
            error: errorMessage,
          };
          prev.enqueue(requestError);
          console.log("Error occurred", requestError);
          return prev;
        });
      }
    }

    // Update this list for subscribers
    runningQueue.update((prev) => prev);

    return response;
  }, API_WAIT_TIME_MS)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const finishedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, 0)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIActionError, void>>
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
let parsedSettings = JSON.parse(localStorage.getItem("gothamSettings"));

if (!parsedSettings) {
  parsedSettings = {
    autoHideEnabled: false,
    autoHideRooms: new Set(),
    autoHidewaitMinutes: 5,
  };
}

// Convert parsed list into set
parsedSettings.autoHideRooms = new Set(parsedSettings.autoHideRooms);

/**
 * @type import("svelte/store").Writable<import("./types/state").AppSettings>
 */
export const settings = writable(parsedSettings);
