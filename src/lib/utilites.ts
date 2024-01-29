import type { APIAction, APIRequest } from "../types/api";

export const STATION_NAME_REGEX =
  /^\s?((AMXL)?.?[A-Z]{3}[1-9]{1}.?.?(-|–).?.Central[\s]?Ops.?(-|–).?[A-Za-z]+)|DON3 - East - Central Ops$/g;

export async function sleepms(milliseconds: number) {
  return new Promise<void>((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

export const INVITE_ERRORS_MAP = {
  401: {
    message: "Token expired, try again",
    retry: true,
  },
  409: {
    message: "Already in room.",
    retry: false,
  },
};

export const HIDE_ROOMS_ERRORS_MAP = {};

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

export function truncateString(
  s: string,
  maxLength: number,
  cutoffString?: string
) {
  if (!cutoffString) {
    cutoffString = "...";
  }

  if (s.length > maxLength) {
    return s.substring(0, maxLength + 1) + cutoffString;
  } else {
    return s;
  }
}

export function getIntersection<T>(set1: Set<T>, set2: Set<T>) {
  const intersection = new Set<T>();
  for (let i of set2) {
    if (set1.has(i)) {
      intersection.add(i);
    }
  }
  return intersection;
}

export function leftPad(str: string, length: number, char?: string) {
  if (str.length >= length) return str;

  if (!char) char = " ";

  let padded = new Array(length).fill(char);

  for (let i = 0; i < str.length; i++) {
    padded[i + length - str.length] = str[i];
  }

  return padded.join("");
}

export function blobToBase64(blob: Blob) {
  return new Promise<string | ArrayBuffer>((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(btoa(reader.result as string));
    reader.readAsBinaryString(blob);
  });
}

export async function gzip(data: string) {
  const cs = new CompressionStream("gzip");
  const blob = new Blob([data]);
  const compressedStream = blob.stream().pipeThrough(cs);
  const gzipData = await new Response(compressedStream).blob();
  return (await blobToBase64(gzipData)) as string;
}

export async function ungzip(base64: string) {
  const b64decoded = atob(base64);

  const arrayBuffer = new ArrayBuffer(b64decoded.length);

  // Create a new Uint8Array from the ArrayBuffer
  const uint8Array = new Uint8Array(arrayBuffer);

  // Copy the binary string to the Uint8Array
  for (let i = 0; i < b64decoded.length; i++) {
    uint8Array[i] = b64decoded.charCodeAt(i);
  }

  const blobgzip = new Blob([uint8Array], {
    type: "application/octet-stream",
  });

  const ds = new DecompressionStream("gzip");
  const decompressedStream = blobgzip.stream().pipeThrough(ds);

  const originalText = await new Response(decompressedStream).text();
  return originalText;
}

export function randomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function objectifyInstance(instance: any) {
  let ret = {};
  if (typeof instance !== "object") {
    ret[`${typeof instance}`] = instance;
  }

  for (let key in instance) {
    if (typeof instance[key] === "object") {
      ret[key] = objectifyInstance(instance[key]);
    } else if (typeof instance[key] === "function") {
      ret[key] = "function";
    } else {
      ret[key] = instance[key];
    }
  }

  return ret;
}

export function stringifyInstance(instance: {}) {
  return JSON.stringify(objectifyInstance(instance));
}
