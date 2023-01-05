// Set the Promise polyfill before globals.
import "../../promise/set-promise-polyfill-if-needed";
// Import `./globals` that the globals are cached before this runs.
import "../../builtin-globals";

import { PromisePolyfillConstructor } from "../../promise/polyfill";

import "./overwrite-globals";

// declare global {
//   // rome-ignore lint/suspicious/noShadowRestrictedNames: This is where we export `Promise`.
//   var Promise: PromiseConstructor;
// }
(window as any).Promise = PromisePolyfillConstructor;
