// Set the Promise polyfill before globals.
import "../promise/set-polyfill-for-globals";
// Import `./globals` that the globals are cached before this runs.
import "../globals";

import { PromiseConstructor } from "../promise/es6-promise";
import { PromisePolyfillConstructor } from "../promise/polyfill";

import "./overwrite-globals";

// declare global {
//   // rome-ignore lint/suspicious/noShadowRestrictedNames: This is where we export `Promise`.
//   var Promise: PromiseConstructor;
// }
(window as any).Promise = PromisePolyfillConstructor;
