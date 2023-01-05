import { setPromiseConstructor } from "./constructor";
import { PromisePolyfillConstructor } from "./polyfill";

(window as any).Promise || setPromiseConstructor(PromisePolyfillConstructor);
