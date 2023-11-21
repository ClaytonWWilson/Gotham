import type { APIAction, APIRequest } from "../types/api";

export async function sleepms(milliseconds: number) {
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

/**
 * @description Wrapper for GM_xmlhttpRequest that makes it promise-based instead of callback-based
 * @param {Tampermonkey.Request.<object>} request The request to be sent
 * @returns {Tampermonkey.Response<object>} The response of GM_xmlhttpRequest whether it resolves or rejects
 */
async function sendAsyncRequest(
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
    console.log("Sending request", params);
    let apiToken = localStorage.getItem("X-Chime-Auth-Token");

    if (!apiToken) {
      console.error("API token is missing from browser storage.");
      reject("API token is missing from browser storage.");
    }

    apiToken = apiToken.replace(/"/g, "");

    apiToken = `_aws_wt_session=${apiToken}`;

    if (!params.retries) {
      params.retries = 0;
    }

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

    let counter = 0;

    while (counter <= params.retries) {
      try {
        const response = await sendAsyncRequest(requestParams);

        return resolve(response);
      } catch (response) {
        console.error("Request failed");
        console.log(response);
        counter++;

        await sleepms(1000);
      }
    }

    return reject(`Request failed after ${params.retries} retries`);
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
