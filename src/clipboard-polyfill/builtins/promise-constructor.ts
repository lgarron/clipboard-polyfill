import { PromiseConstructor } from "../promise/es6-promise";
import { originalGlobalThis, originalWindow } from "./window-globalThis";

var promiseConstructorImpl: PromiseConstructor =
  (originalWindow as { Promise?: PromiseConstructor } | undefined)?.Promise ??
  originalGlobalThis?.Promise;
export function setPromiseConstructor(
  newPromiseConstructorImpl: PromiseConstructor,
) {
  return (promiseConstructorImpl = newPromiseConstructorImpl);
}

export function getPromiseConstructor(): PromiseConstructor {
  return promiseConstructorImpl;
}
