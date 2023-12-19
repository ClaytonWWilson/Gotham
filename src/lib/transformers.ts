import { failedQueue, finishedQueue, runningQueue } from "../stores";
import type { APIRequestInfo } from "../types/api";
import {
  HIDE_ROOMS_ERRORS_MAP,
  INVITE_ERRORS_MAP,
  processAPIRequest,
} from "./utilites";

// export function processRemoveAPIRequest() {}

export async function processSimpleAPIRequest(apiRequest: APIRequestInfo) {
  if (!apiRequest.retries) {
    apiRequest.retries = 0;
  }

  let response;
  try {
    response = await processAPIRequest(apiRequest);
    finishedQueue.update((prev) => {
      prev.enqueue({ data: apiRequest, transformer: processSimpleAPIRequest });
      return prev;
    });
  } catch (error) {
    console.log(error);
    apiRequest.retries--;

    if (!error.status) {
      try {
        apiRequest.error = error + "";
      } catch (_err) {
        apiRequest.error = "Error sending request";
      }
    } else {
      let errInfo: { message: string; retry: boolean } | undefined;

      switch (apiRequest.action) {
        case "HIDE":
          errInfo = HIDE_ROOMS_ERRORS_MAP[error.status];
          break;
        case "INVITE":
          errInfo = INVITE_ERRORS_MAP[error.status];
          break;
      }

      if (errInfo && errInfo.message) {
        apiRequest.error = errInfo.message;
      } else {
        apiRequest.error = error + "";
      }
    }

    if (apiRequest.retries >= 0) {
      runningQueue.update((prev) => {
        prev.enqueue(processSimpleAPIRequest, apiRequest);
        return prev;
      });
    } else {
      failedQueue.update((prev) => {
        apiRequest.status = "FAILED";

        prev.enqueue({
          data: apiRequest,
          transformer: processSimpleAPIRequest,
        });
        return prev;
      });
    }
  }

  // Update this list for subscribers
  // runningQueue.update((prev) => prev);

  return response;
}

// /**
//  * @type import("svelte/store").Writable.<AwaitedQueueProcessor.<import("./types/api").APIAction, Tampermonkey.Response<object>>>
//  */
// export const runningQueue = writable(
//   new AwaitedQueueProcessor(async (action, index) => {
//     if (!action.retries) {
//       action.retries = 0;
//     }

//     let response;
//     try {
//       response = await processAPIAction(action);
//       finishedQueue.update((prev) => {
//         prev.enqueue(action);
//         return prev;
//       });
//     } catch (error) {
//       console.log(error);
//       action.retries--;

//       if (!error.status) {
//         try {
//           action.error = error + "";
//         } catch (_err) {
//           action.error = "Error sending request";
//         }
//       } else {
//         switch (error.status) {
//           case 409:
//             action.error = "Already in room";
//             action.retries = -1;
//             break;
//           case 401:
//             action.error = "Token expired, try again";
//             break;
//         }
//       }

//       if (action.retries >= 0) {
//         runningQueue.update((prev) => {
//           prev.enqueue(action);
//           return prev;
//         });
//       } else {
//         failedQueue.update((prev) => {
//           action.status = "FAILED";

//           prev.enqueue(action);
//           return prev;
//         });
//       }
//     }

//     // Update this list for subscribers
//     runningQueue.update((prev) => prev);

//     return response;
//   }, DEFAULT_APP_SETTINGS.requestWaitSeconds * 1000)
// );
