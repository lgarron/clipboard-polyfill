"use strict";

interface IEWindowClipbardData {
  setData: (key: string, value: string) => boolean;
  getData: (key: string) => string | undefined;
}

interface IEWindow extends Window {
  clipboardData: IEWindowClipbardData
}

// Promise polyfill for Internet Explorer.
if (typeof Promise === "undefined") {
  /*! promise-polyfill 2.0.1 */
  (function(a){function b(a,b){return function(){a.apply(b,arguments)}}function c(a){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],i(a,b(e,this),b(f,this))}function d(a){var b=this;return null===this._state?void this._deferreds.push(a):void j(function(){var c=b._state?a.onFulfilled:a.onRejected;if(null===c)return void(b._state?a.resolve:a.reject)(b._value);var d;try{d=c(b._value)}catch(e){return void a.reject(e)}a.resolve(d)})}function e(a){try{if(a===this)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void i(b(c,a),b(e,this),b(f,this))}this._state=!0,this._value=a,g.call(this)}catch(d){f.call(this,d)}}function f(a){this._state=!1,this._value=a,g.call(this)}function g(){for(var a=0,b=this._deferreds.length;b>a;a++)d.call(this,this._deferreds[a]);this._deferreds=null}function h(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function i(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var j=c.immediateFn||"function"==typeof setImmediate&&setImmediate||function(a){setTimeout(a,1)},k=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};c.prototype["catch"]=function(a){return this.then(null,a)},c.prototype.then=function(a,b){var e=this;return new c(function(c,f){d.call(e,new h(a,b,c,f))})},c.all=function(){var a=Array.prototype.slice.call(1===arguments.length&&k(arguments[0])?arguments[0]:arguments);return new c(function(b,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}a[f]=g,0===--e&&b(a)}catch(i){c(i)}}if(0===a.length)return b([]);for(var e=a.length,f=0;f<a.length;f++)d(f,a[f])})},c.resolve=function(a){return a&&"object"==typeof a&&a.constructor===c?a:new c(function(b){b(a)})},c.reject=function(a){return new c(function(b,c){c(a)})},c.race=function(a){return new c(function(b,c){for(var d=0,e=a.length;e>d;d++)a[d].then(b,c)})},"undefined"!=typeof module&&module.exports?module.exports=c:a.Promise||(a.Promise=c)})(this);
}

export class clipboard {
  private static DEBUG: boolean = false;
  private static misingPlainTextWarning = true;

  // TODO: Compile debug logging code out of release builds?
  private static enableDebugLogging() {
    clipboard.DEBUG = true;
  }

  private static suppressMissingPlainTextWarning() {
    this.misingPlainTextWarning = false;
  }

  protected static copyListener(tracker: clipboard.FallbackTracker, data: clipboard.DT, e: ClipboardEvent): void {
    if (clipboard.DEBUG) (console.info || console.log).call(console, "listener called");
    tracker.listenerCalled = true;
    data.forEach((value: string, key: string) => {
      e.clipboardData.setData(key, value);
      if (key === clipboard.DataTypes.TEXT_PLAIN && e.clipboardData.getData(key) != value) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "Setting text/plain failed.");
        tracker.listenerSetPlainTextFailed = true;
      }
    });
    e.preventDefault();
  }

  protected static execCopy(data: clipboard.DT): clipboard.FallbackTracker {
    var tracker = new clipboard.FallbackTracker();
    var listener = this.copyListener.bind(this, tracker, data);

    document.addEventListener("copy", listener);
    try {
      tracker.execCommandReturnedTrue = document.execCommand("copy");
    } finally {
      document.removeEventListener("copy", listener);
    }
    return tracker;
  }

  // Create a temporary DOM element to select, so that `execCommand()` is not
  // rejected.
  private static copyUsingTempSelection(e: HTMLElement, data: clipboard.DT): clipboard.FallbackTracker {
    clipboard.Selection.select(e);
    var tracker = this.execCopy(data);
    clipboard.Selection.clear();
    return tracker;
  }

  // Create a temporary DOM element to select, so that `execCommand()` is not
  // rejected.
  private static copyUsingTempElem(data: clipboard.DT): clipboard.FallbackTracker {
    var tempElem = document.createElement("div");
    // Place some text in the elem so that Safari has something to select.
    tempElem.textContent = "temporary element";
    document.body.appendChild(tempElem);

    var tracker = this.copyUsingTempSelection(tempElem, data);

    document.body.removeChild(tempElem);
    return tracker;
  }

  // Uses shadow DOM.
  private static copyTextUsingDOM(str: string): boolean {
    if (clipboard.DEBUG) (console.info || console.log).call(console, "attempting to copy text using DOM");

    var tempElem = document.createElement("div");
    var shadowRoot = tempElem.attachShadow({mode: "open"});
    document.body.appendChild(tempElem);

    var span = document.createElement("span");
    span.textContent = str;
    span.style.whiteSpace = "pre-wrap"; // TODO: Use `innerText` above instead?
    shadowRoot.appendChild(span);
    clipboard.Selection.select(span);

    var result = document.execCommand("copy");

    // clipboard.Selection.clear();
    document.body.removeChild(tempElem);

    return result;
  }

  public static writeIE(data: clipboard.DT): boolean {
    // IE supports text or URL, but not HTML: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
    // TODO: Write URLs to `text/uri-list`? https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
    var text = data.getData("text/plain");
    if (text !== undefined) {
      return (window as IEWindow).clipboardData.setData("Text", text);
    }

    throw ("No `text/plain` value was specified.");
  }

  public static write(data: clipboard.DT): Promise<void> {
    if (this.misingPlainTextWarning && !data.getData(clipboard.DataTypes.TEXT_PLAIN)) {
      (console.warn || console.log).call(console,
        "[clipboard.js] clipboard.write() was called without a "+
        "`text/plain` data type. On some platforms, this may result in an "+
        "empty clipboard. Call clipboard.suppressMissingPlainTextWarning() "+
        "to suppress this warning.");
    }

    // TODO: Allow fallback graph other than a single line.

    return new Promise<void>((resolve, reject) => {
      // Internet Explorer
      if (typeof ClipboardEvent === "undefined" &&
          typeof (window as IEWindow).clipboardData !== "undefined" &&
          typeof (window as IEWindow).clipboardData.setData !== "undefined") {
        if (this.writeIE(data)) {
          resolve()
        } else {
          reject(new Error("Copying failed, possibly because the user rejected it."));
        }
        return;
      }

      var tracker = this.execCopy(data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "Regular copy command succeeded.");
        resolve();
        return;
      }

      // Success detection on Edge is not possible, due to bugs in all 4
      // detection mechanisms we could try to use. Assume success.
      if (tracker.listenerCalled && navigator.userAgent.indexOf("Edge") > -1) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "User agent contains \"Edge\". Blindly assuming success.");
        resolve();
        return;
      }

      // Fallback 1 for desktop Safari.
      tracker = this.copyUsingTempSelection(document.body, data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "Copied using temporary document.body selection.");
        resolve();
        return;
      }

      // Fallback 2 for desktop Safari. 
      tracker = this.copyUsingTempElem(data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "Copied using selection of temporary element added to DOM.");
        resolve();
        return;
      }

      // Fallback for iOS Safari.
      var text = data.getData(clipboard.DataTypes.TEXT_PLAIN);
      if (text !== undefined) {
        if (clipboard.DEBUG) (console.info || console.log).call(console, "Copied text using DOM.");
        resolve();
        return;
      }

      reject(new Error("Copy command failed."));
    });
  }

  static writeText(s: string): Promise<void> {
    var dt = new clipboard.DT();
    dt.setData(clipboard.DataTypes.TEXT_PLAIN, s);
    return clipboard.write(dt);
  }

  static read(): Promise<clipboard.DT> {
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }

  static readText(): Promise<string> {
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }

  // Legacy v1 API.
  static copy(obj: string|{[key:string]:string}|HTMLElement): Promise<void> {
    (console.warn || console.log).call(console, "[clipboard.js] The clipboard.copy() API is deprecated and may be removed in a future version. Please switch to clipboard.write() or clipboard.writeText().");

    return new Promise((resolve, reject) => {
      var data: clipboard.DT;
      if (typeof obj === "string") {
        data = clipboard.DT.fromText(obj);
      } else if (obj instanceof HTMLElement) {
        data = clipboard.DT.fromElement(obj);
      } else if (obj instanceof Object) {
        data = clipboard.DT.fromObject(obj);
      } else {
        reject("Invalid data type. Must be string, DOM node, or an object mapping MIME types to strings.");
        return;
      }
      this.write(data);
    });
  }

  // Legacy v1 API.
  static paste(): Promise<string> {
    (console.warn || console.log).call(console, "[clipboard.js] The clipboard.paste() API is deprecated and may be removed in a future version. Please switch to clipboard.read() or clipboard.readText().");
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }
}

export namespace clipboard {
  export const DataTypes: {[key:string]:string} = {
    TEXT_PLAIN: "text/plain",
    TEXT_HTML: "text/html"
  }

  export const DataTypeLookup: {[key:string]:boolean} = {
    "text/plain": true,
    "text/html": true
  }

  export class DT {
    private m: Map<string, string> = new Map<string, string>();

    setData(type: string, value: string): void {
      if (!(type in DataTypeLookup)) {
        (console.warn || console.log).call(console, "[clipboard.js] Unknown data type: " + type);
      }

      this.m.set(type, value);
    }

    getData(type: string): string | undefined {
      return this.m.get(type);
    }

    // TODO: Provide an iterator consistent with DataTransfer.
    forEach(f: (value: string, key: string) => void): void {
      return this.m.forEach(f);
    }

    static fromText(s: string): DT {
      var dt = new DT();
      dt.setData(clipboard.DataTypes.TEXT_PLAIN, s);
      return dt;
    }

    static fromObject(obj: {[key:string]:string}): DT {
      var dt = new DT();
      for (var key in obj) {
        dt.setData(key, obj[key]);
      }
      return dt;
    }

    static fromElement(e: HTMLElement): DT {
      var dt = new DT();
      dt.setData(clipboard.DataTypes.TEXT_PLAIN, e.innerText);
      dt.setData(clipboard.DataTypes.TEXT_HTML, new XMLSerializer().serializeToString(e));
      return dt;
    }
  }

  export class Selection {
    static select(elem: Element): void {
      var sel = document.getSelection();
      var range = document.createRange();
      range.selectNodeContents(elem);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    static clear(): void {
      var sel = document.getSelection();
      sel.removeAllRanges();
    }
  }

  export class FallbackTracker {
    public execCommandReturnedTrue: boolean = false;
    public listenerCalled: boolean = false;
    public listenerSetPlainTextFailed: boolean = false;
  }
}
