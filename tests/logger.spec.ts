import { expect, test } from "@playwright/test";
import { Logger } from "../src/lib/Logger";

// Can't use tampermonkey since the tampermonkey functions are not defined in the testing suite
test("Constructors", () => {
  const _logger1 = new Logger({ tampermonkey: false });
  const _logger2 = new Logger({ console: true });
  const _logger3 = new Logger({ console: false, tampermonkey: false });
  const _logger4 = new Logger({ callback: () => {} });
  const _logger5 = new Logger({
    console: true,
    tampermonkey: false,
    callback: () => {},
  });
});

test("Log Messages", () => {
  let logs = "";
  const logger = new Logger({
    tampermonkey: false,
    console: false,
    callback: (message) => {
      logs += message + "\n";
    },
  });
  logger.log("logging a");

  logger.trace("logging b");
  logger.debug("logging c");
  logger.info("logging d");
  logger.warn("logging e");
  logger.fatal("logging f");

  const lines = logs.split("\n");
  expect(lines[0]).toContain("fatal");
  expect(lines[0]).toContain("logging a");

  expect(lines[1]).toContain("trace");
  expect(lines[1]).toContain("logging b");

  expect(lines[2]).toContain("debug");
  expect(lines[2]).toContain("logging c");

  expect(lines[3]).toContain("info");
  expect(lines[3]).toContain("logging d");

  expect(lines[4]).toContain("warn");
  expect(lines[4]).toContain("logging e");

  expect(lines[5]).toContain("fatal");
  expect(lines[5]).toContain("logging f");

  expect(lines.length).toBe(7);
});

test("Log messages with context", () => {
  let logs = "";
  const logger = new Logger({
    callback: (message) => {
      logs += message + "\n";
    },
  });

  logger.debug("test context", { data: "hello world" });
  const req = new Request("https://www.github.com");

  logger.info("test context", {
    request: req,
  });

  const lines = logs.split("\n");
  expect(lines[0]).toContain('{"level":20,"data":"hello world"}');
  expect(lines[1]).toContain("https://www.github.com");
});

test("Logs contain timestamps", () => {
  let logs = "";
  const logger = new Logger({
    callback: (message) => {
      logs += message + "\n";
    },
  });

  logger.log("test");

  expect(logs).toMatch(/^[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+:[0-9]+.[0-9]+Z/gm);
});
