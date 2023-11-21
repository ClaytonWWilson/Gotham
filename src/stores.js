import { writable } from "svelte/store";
import AwaitedQueueProcessor from "./lib/AwaitedQueueProcessor";
import { processAPIAction } from "./lib/utilites";

const API_WAIT_TIME_MS = 1000;

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const plannedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, API_WAIT_TIME_MS)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, Tampermonkey.Response<object>>>
 */
export const runningQueue = writable(
  new AwaitedQueueProcessor(async (action, index) => {
    const response = await processAPIAction(action);

    // Update this list for subscribers
    runningQueue.update((prev) => prev);

    // TODO: Move failed to failed queue
    // TODO: Moved finished to finished
    return response;
  }, API_WAIT_TIME_MS)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const finishedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, API_WAIT_TIME_MS)
);

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, void>>
 */
export const failedQueue = writable(
  new AwaitedQueueProcessor(async (_a) => {}, API_WAIT_TIME_MS)
);

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeRooms>
 */
export const roomList = writable({ rooms: [], loading: false });

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeContacts>
 */
export const contactList = writable({ contacts: [], loading: false });
