const importPromise = import(
  "../clipboard-polyfill/entries/es6/clipboard-polyfill.es6"
);

const globalPromise = globalThis.Promise;
// @ts-ignore: We're deleting something that's not normally meant to be deleted.
delete globalThis.Promise;

let caughtError: Error | undefined;
try {
  await importPromise;
} catch (e) {
  caughtError = e;
}

globalThis.Promise = globalPromise;

import { equal } from "node:assert";

// TODO: Use `match` once `node` v19.4 is available from Homebrew: https://nodejs.org/api/assert.html#assertmatchstring-regexp-messageg
equal(
  !!caughtError!.message.match(/No `Promise` implementation available/),
  true,
);
