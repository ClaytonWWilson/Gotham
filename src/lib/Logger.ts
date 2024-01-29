import { gzip, randomString, stringifyInstance } from "./utilites";

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  FATAL = 50,
}

enum LogLabel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  FATAL = "fatal",
}

export interface LogOutputs {
  console?: boolean;
  tampermonkey?: boolean;
  callback?: (message: string) => any;
}

export interface LogContext {
  level?: number;
  [key: string]: any;
}

interface LogMeta {
  context: LogContext;
  time: number;
}

interface BucketInfo {
  name: string;
  size: number;
  createdAt: number;
}

const DEFAULT_OUTPUTS: LogOutputs = { console: true, tampermonkey: true };
const MESSAGE_STYLE = "background: inherit; color: inherit;";

const STYLES = {
  trace: {
    background: "#949494",
    color: "#fff",
  },
  debug: {
    background: "#fe7bf3",
    color: "#fff",
  },
  info: {
    background: "#65f10e",
    color: "#fff",
  },
  warn: {
    background: "#faf200",
    color: "#000",
  },
  fatal: {
    background: "#cc0018",
    color: "#fff",
  },
};

function getLabel(level: number) {
  if (level <= LogLevel.TRACE) {
    return LogLabel.TRACE;
  } else if (level <= LogLevel.DEBUG) {
    return LogLabel.DEBUG;
  } else if (level <= LogLevel.INFO) {
    return LogLabel.INFO;
  } else if (level <= LogLevel.WARN) {
    return LogLabel.WARN;
  } else {
    return LogLabel.FATAL;
  }
}

export class Logger {
  private buffer: string;
  private bucketIndex: BucketInfo[];
  private bucketIndexKey: string;
  private outputs: LogOutputs;

  constructor(
    outputs: LogOutputs = DEFAULT_OUTPUTS,
    bucketIndexKey: string = "bucket_index"
  ) {
    this.buffer = "";
    this.outputs = outputs;
    if (this.outputs.console === undefined) this.outputs.console = false;
    if (this.outputs.tampermonkey === undefined)
      this.outputs.tampermonkey = false;

    this.bucketIndexKey = bucketIndexKey;
    if (this.outputs.tampermonkey) {
      this.bucketIndex = GM_getValue(this.bucketIndexKey, []);
    } else {
      this.bucketIndex = [];
    }
  }

  log(message: string, context: LogContext = {}) {
    const level = context.level ? context.level : LogLevel.FATAL;
    const label = getLabel(level);

    const meta: LogMeta = {
      context,
      time: new Date().valueOf(),
    };

    if (this.outputs.console) {
      this.consolePrint(label, message, meta);
    }

    const textOutput = `${new Date(
      meta.time
    ).toISOString()} [${label}] ${message} - ${stringifyInstance(
      meta.context
    )}`;

    if (this.outputs.tampermonkey) {
      this.buffer += `${textOutput}\n`;
    }

    if (this.outputs.callback) {
      this.outputs.callback(textOutput);
    }

    if (this.buffer.length >= 100_000) {
      this.flush();
    }
  }

  trace(message: string, context?: Object) {
    this.log(message, {
      level: LogLevel.TRACE,
      stacktrace: new Error().stack.slice(13), // Remove the "Error"
      ...context,
    });
  }

  debug(message: string, context?: Object) {
    this.log(message, { level: LogLevel.DEBUG, ...context });
  }

  info(message: string, context?: Object) {
    this.log(message, { level: LogLevel.INFO, ...context });
  }

  warn(message: string, context?: Object) {
    this.log(message, { level: LogLevel.WARN, ...context });
  }

  fatal(message: string, context?: Object) {
    this.log(message, { level: LogLevel.FATAL, ...context });
  }

  private consolePrint(label: LogLabel, message: string, meta: LogMeta) {
    const style = `background: ${STYLES[label].background}; color: ${STYLES[label].color}; font-weight: bold; border-radius: 4px;`;

    switch (label) {
      case LogLabel.TRACE:
        console.trace(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.DEBUG:
        console.debug(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.INFO:
        console.info(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.WARN:
        console.warn(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.FATAL:
        console.error(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      default:
        console.log(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
    }
  }

  bufferLength() {
    return this.buffer.length;
  }

  async flush() {
    // Clear buffer
    let tempBuffer = this.buffer;
    this.buffer = "";

    if (!this.outputs.tampermonkey) {
      return;
    }

    // Generate non-clashing name
    let newBucketName = randomString(10).toLowerCase();
    while (GM_getValue(newBucketName, undefined) !== undefined) {
      newBucketName = randomString(10);
    }

    // gzip data
    const gzipped = await gzip(tempBuffer);

    // Update bucketIndex with info
    const newBucket: BucketInfo = {
      name: newBucketName,
      size: gzipped.length,
      createdAt: new Date().valueOf(),
    };

    // write bucketIndex to disk
    this.bucketIndex.push(newBucket);
    GM_setValue(this.bucketIndexKey, JSON.stringify(this.bucketIndex));

    // write gzipped data to new bucket
    GM_setValue(newBucketName, gzipped);

    // delete old buckets if the number is too large
    if (this.bucketIndex.length <= 10) {
      return;
    }

    let oldBuckets = this.bucketIndex
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, -10);

    oldBuckets.forEach((oldBucket) => {
      GM_deleteValue(oldBucket.name);
      let deleteIndex = this.bucketIndex.findIndex(
        (indexBucket) => indexBucket.name === oldBucket.name
      );

      if (deleteIndex === -1) {
        console.error("Invalid index for bucket");
        return;
      }

      this.bucketIndex.splice(deleteIndex, 1);
    });

    // Update tampermonkey bucket index
    GM_setValue(this.bucketIndexKey, JSON.stringify(this.bucketIndex));
  }
}
