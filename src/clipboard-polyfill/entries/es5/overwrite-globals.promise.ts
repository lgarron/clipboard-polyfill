// Set the Promise polyfill before globals.
import "../../promise/set-promise-polyfill-if-needed";
// Import `./globals` that the globals are cached before this runs.
import "../../builtin-globals";

import { PromisePolyfillConstructor } from "../../promise/polyfill";

import "./overwrite-globals";

(window as any).Promise = PromisePolyfillConstructor;
