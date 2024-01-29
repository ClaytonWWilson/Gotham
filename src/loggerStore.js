import { writable } from "svelte/store";
import { Logger } from "./lib/Logger";

export const logger = writable(
  new Logger({
    outputs: {
      console: { enabled: true },
      tampermonkey: {
        enabled: true,
        bucketIndexKey: "bucket_index",
        maxBuckets: 10,
      },
    },
    bufferCapacity: 100000,
  })
);
