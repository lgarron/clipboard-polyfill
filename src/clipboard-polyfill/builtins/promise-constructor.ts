import { PromiseConstructor } from "../promise/es6-promise";
import { originalGlobalThis, originalWindow } from "./window-globalThis";

var promiseConstructorImpl: PromiseConstructor | undefined =
  (originalWindow as { Promise?: PromiseConstructor } | undefined)?.Promise ??
  originalGlobalThis?.Promise;

// This must be called *before* `builtin-globals.ts` is imported, or it has no effect.
export function setPromiseConstructor(
  newPromiseConstructorImpl: PromiseConstructor,
) {
  return (promiseConstructorImpl = newPromiseConstructorImpl);
}

export function getPromiseConstructor(): PromiseConstructor {
  if (!promiseConstructorImpl) {
    throw new Error(
      "No `Promise` implementation available for `clipboard-polyfill`. Consider using: https://github.com/lgarron/clipboard-polyfill#flat-file-version-with-promise-included",
    );
  }
  return promiseConstructorImpl;
}
