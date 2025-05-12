// Set the Promise polyfill before globals.
import "../../promise/set-promise-polyfill-if-needed";

import type { PromiseConstructor } from "../../promise/es6-promise";
import { PromisePolyfillConstructor } from "../../promise/polyfill";

import "./window-var";

declare global {
  var PromisePolyfill: PromiseConstructor;
}

window.PromisePolyfill = PromisePolyfillConstructor;
