import { setPromiseConstructor } from "../promise/constructor";
import { PromisePolyfillConstructor } from "./polyfill";
setPromiseConstructor(PromisePolyfillConstructor);
