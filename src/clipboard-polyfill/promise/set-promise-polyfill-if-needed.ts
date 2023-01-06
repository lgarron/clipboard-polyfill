import { setPromiseConstructor } from "../builtins/promise-constructor";
import { PromisePolyfillConstructor } from "./polyfill";

(window as any).Promise || setPromiseConstructor(PromisePolyfillConstructor);
