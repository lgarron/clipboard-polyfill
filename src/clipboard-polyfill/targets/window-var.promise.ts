// Set the Promise polyfill before globals.
import "../promise/set-promise-polyfill-if-needed";
// Import `../globals` that the globals are cached before this runs.
import "../globals";

import { PromiseConstructor } from "../promise/es6-promise";
import { PromisePolyfillConstructor } from "../promise/polyfill";

import "./window-var";

declare global {
  var PromisePolyfill: PromiseConstructor;
}

window.PromisePolyfill = PromisePolyfillConstructor;
