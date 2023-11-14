import { writable, Writable } from "svelte/store";
import AwaitedQueueProcessor from "./lib/AwaitedQueueProcessor";
import { processAPIAction, sendApiRequest } from "./lib/utilites";
import { APIAction } from "./types/api";

/**
 * @type Writable.<AwaitedQueueProcessor.<APIAction, Tampermonkey.Response<object>>>
 */
export const plannedQueue = new writable(
  new AwaitedQueueProcessor(processAPIAction, 1000)
);
