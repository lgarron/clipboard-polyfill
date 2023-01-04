import "../globals";
import { setPromiseConstructor } from "../globals";
import { PromiseConstructor } from "../promise/es6-promise";
import { PromisePolyfillConstructor } from "../promise/polyfill";

import "./overwrite-globals";
setPromiseConstructor(PromisePolyfillConstructor);

declare global {
  // rome-ignore lint/suspicious/noShadowRestrictedNames: This is where we export `Promise`.
  var Promise: PromiseConstructor;
}
window.Promise = PromisePolyfillConstructor;
