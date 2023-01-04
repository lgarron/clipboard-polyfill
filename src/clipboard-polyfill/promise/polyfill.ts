import type { PromiseConstructor } from "./es6-promise";

/**
 * @this {PromisePolyfill}
 */
function finallyConstructor(callback) {
  var thisConstructor = this.constructor;
  return this.then(
    function (value) {
      // @ts-ignore
      return thisConstructor.resolve(callback()).then(function () {
        return value;
      });
    },
    function (reason) {
      // @ts-ignore
      return thisConstructor.resolve(callback()).then(function () {
        // @ts-ignore
        return thisConstructor.reject(reason);
      });
    },
  );
}

function allSettled(arr) {
  var P = this;
  return new P(function (resolve, reject) {
    if (!(arr && typeof arr.length !== "undefined")) {
      return reject(
        new TypeError(
          // rome-ignore lint/style/useTemplate: Vendored code.
          typeof arr +
            " " +
            arr +
            " is not iterable(cannot read property Symbol(Symbol.iterator))",
        ),
      );
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      if (val && (typeof val === "object" || typeof val === "function")) {
        var then = val.then;
        if (typeof then === "function") {
          then.call(
            val,
            function (val) {
              res(i, val);
            },
            function (e) {
              args[i] = { status: "rejected", reason: e };
              if (--remaining === 0) {
                resolve(args);
              }
            },
          );
          return;
        }
      }
      args[i] = { status: "fulfilled", value: val };
      if (--remaining === 0) {
        resolve(args);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== "undefined");
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function () {
    // rome-ignore lint/style/noArguments: Vendored code.
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */

export function PromisePolyfill(fn) {
  if (!(this instanceof PromisePolyfill))
    throw new TypeError("Promises must be constructed via new");
  if (typeof fn !== "function") throw new TypeError("not a function");
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {PromisePolyfill|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  PromisePolyfill._immediateFn(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError("A promise cannot be resolved with itself.");
    if (
      newValue &&
      (typeof newValue === "object" || typeof newValue === "function")
    ) {
      var then = newValue.then;
      if (newValue instanceof PromisePolyfill) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === "function") {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    PromisePolyfill._immediateFn(function () {
      if (!self._handled) {
        PromisePolyfill._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      },
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

PromisePolyfill.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};

PromisePolyfill.prototype.then = function (onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

PromisePolyfill.prototype["finally"] = finallyConstructor;

PromisePolyfill.all = function (arr) {
  return new PromisePolyfill(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError("Promise.all accepts an array"));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === "object" || typeof val === "function")) {
          var then = val.then;
          if (typeof then === "function") {
            then.call(
              val,
              function (val) {
                res(i, val);
              },
              reject,
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

PromisePolyfill.allSettled = allSettled;

PromisePolyfill.resolve = function (value) {
  if (
    value &&
    typeof value === "object" &&
    value.constructor === PromisePolyfill
  ) {
    return value;
  }

  return new PromisePolyfill(function (resolve) {
    resolve(value);
  });
};

PromisePolyfill.reject = function (value) {
  return new PromisePolyfill(function (resolve, reject) {
    reject(value);
  });
};

PromisePolyfill.race = function (arr) {
  return new PromisePolyfill(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError("Promise.race accepts an array"));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      PromisePolyfill.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
PromisePolyfill._immediateFn =
  // @ts-ignore
  (typeof setImmediate === "function" &&
    function (fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function (fn) {
    setTimeoutFunc(fn, 0);
  };

PromisePolyfill._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== "undefined" && console) {
    console.warn("Possible Unhandled Promise Rejection:", err); // eslint-disable-line no-console
  }
};

export var PromisePolyfillConstructor: PromiseConstructor =
  PromisePolyfill as any as PromiseConstructor;

// Set the Promise polyfill before getting globals.
import { setPromiseConstructor } from "../promise/constructor";
setPromiseConstructor(PromisePolyfillConstructor);
