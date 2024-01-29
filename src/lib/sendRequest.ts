import { logger } from "../loggerStore";
import type { APIAction, APIRequest } from "../types/api";
// import { sendApiRequest, sendAsyncRequest } from "./sendRequest";

/**
 * @description Wrapper for GM_xmlhttpRequest that makes it promise-based instead of callback-based
 * @param {Tampermonkey.Request.<object>} request The request to be sent
 * @returns {Tampermonkey.Response<object>} The response of GM_xmlhttpRequest whether it resolves or rejects
 */
export async function sendAsyncRequest(
  request: Tampermonkey.Request
): Promise<Tampermonkey.Response<object>> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      ...request,
      onload: (res) => {
        if (res.status > 100 && res.status < 400) {
          resolve(res);
        } else {
          reject(res);
        }
      },
    });
  });
}
export async function sendApiRequest(
  params: APIRequest
): Promise<Tampermonkey.Response<object>> {
  return new Promise(async (resolve, reject) => {
    logger.update((log) => {
      log.debug("Sending request", params);
      return log;
    });
    let apiToken = localStorage.getItem("X-Chime-Auth-Token");

    if (!apiToken) {
      logger.update((log) => {
        log.warn("API token is missing from browser storage.");
        return log;
      });
      reject("API token is missing from browser storage.");
    }

    apiToken = apiToken.replace(/"/g, "");

    apiToken = `_aws_wt_session=${apiToken}`;

    let requestParams: Tampermonkey.Request<object> = {
      url: params.endpoint,
      method: params.method,
      headers: {
        "x-chime-auth-token": apiToken,
      },
    };

    if (params.payload) {
      requestParams.data = JSON.stringify(params.payload);
      requestParams.headers = {
        ...requestParams.headers,
        "Content-Type": "application/json",
      };
    }

    try {
      const response = await sendAsyncRequest(requestParams);
      return resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}
export async function processAPIAction(
  action: APIAction
): Promise<Tampermonkey.Response<object>> {
  action.startedAt = new Date();
  action.status = "RUNNING";

  const response = await sendApiRequest(action.request);

  action.status = "COMPLETE";
  action.finishedAt = new Date();

  return response;
}
