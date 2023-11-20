import { writable } from "svelte/store";
import AwaitedQueueProcessor from "./lib/AwaitedQueueProcessor";
import { processAPIAction } from "./lib/utilites";
// import { APIAction, AppChimeRooms, AppChimeContacts } from "./types/api";

/**
 * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, Tampermonkey.Response<object>>>
 */
export const plannedQueue = writable(
  new AwaitedQueueProcessor(processAPIAction, 1000)
);

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeRooms>
 */
export const roomList = writable({ rooms: [], loading: false });

/**
 * @type import("svelte/store").Writable.<import("./types/api").AppChimeContacts>
 */
export const contactList = writable({ contacts: [], loading: false });
