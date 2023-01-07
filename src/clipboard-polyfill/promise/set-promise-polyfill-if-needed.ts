import { setPromiseConstructor } from "../builtins/promise-constructor";
import { originalWindow } from "../builtins/window-globalThis";
import { PromisePolyfillConstructor } from "./polyfill";

originalWindow?.Promise || setPromiseConstructor(PromisePolyfillConstructor);
