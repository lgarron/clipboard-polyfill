import { PromiseConstructor } from "./es6-promise";

var promiseConstructorImpl: PromiseConstructor = (window as any)
  .Promise as PromiseConstructor;
export function setPromiseConstructor(
  newPromiseConstructorImpl: PromiseConstructor,
) {
  return (promiseConstructorImpl = newPromiseConstructorImpl);
}

export function getPromiseConstructor(): PromiseConstructor {
  return promiseConstructorImpl;
}
