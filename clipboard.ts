import {Promise} from "es6-promise";
import {DataTypes} from "./DataTypes"
import DT from "./DT";

interface IEWindowClipboardData {
  setData: (key: string, value: string) => boolean;
  getData: (key: string) => string|null;
}

interface IEWindow extends Window {
  clipboardData: IEWindowClipboardData
}

export default class ClipboardPolyfill {
  private static DEBUG: boolean = false;
  private static missingPlainTextWarning = true;
  public static DT = DT;

  // TODO: Compile debug logging code out of release builds?
  public static enableDebugLogging() {
    this.DEBUG = true;
  }

  private static suppressMissingPlainTextWarning() {
    this.missingPlainTextWarning = false;
  }

  private static seemToBeInIE() {
    return typeof ClipboardEvent === "undefined" &&
           typeof (window as IEWindow).clipboardData !== "undefined" &&
           typeof (window as IEWindow).clipboardData.setData !== "undefined";
  }

  protected static copyListener(tracker: FallbackTracker, data: DT, e: ClipboardEvent): void {
    if (this.DEBUG) (console.info || console.log).call(console, "listener called");
    tracker.listenerCalled = true;
    data.forEach((value: string, key: string) => {
      e.clipboardData.setData(key, value);
      if (key === DataTypes.TEXT_PLAIN && e.clipboardData.getData(key) != value) {
        if (this.DEBUG) (console.info || console.log).call(console, "Setting text/plain failed.");
        tracker.listenerSetPlainTextFailed = true;
      }
    });
    e.preventDefault();
  }

  protected static execCopy(data: DT): FallbackTracker {
    var tracker = new FallbackTracker();
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
  private static copyUsingTempSelection(e: HTMLElement, data: DT): FallbackTracker {
    Selection.select(e);
    var tracker = this.execCopy(data);
    Selection.clear();
    return tracker;
  }

  // Create a temporary DOM element to select, so that `execCommand()` is not
  // rejected.
  private static copyUsingTempElem(data: DT): FallbackTracker {
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
    if (this.DEBUG) (console.info || console.log).call(console, "attempting to copy text using DOM");

    var tempElem = document.createElement("div");
    var shadowRoot = tempElem.attachShadow({mode: "open"});
    document.body.appendChild(tempElem);

    var span = document.createElement("span");
    span.textContent = str;
    span.style.whiteSpace = "pre-wrap"; // TODO: Use `innerText` above instead?
    shadowRoot.appendChild(span);
    Selection.select(span);

    var result = document.execCommand("copy");

    // Selection.clear();
    document.body.removeChild(tempElem);

    return result;
  }

  public static writeIE(data: DT): boolean {
    // IE supports text or URL, but not HTML: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
    // TODO: Write URLs to `text/uri-list`? https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
    var text = data.getData("text/plain");
    if (text !== undefined) {
      return (window as IEWindow).clipboardData.setData("Text", text);
    }

    throw ("No `text/plain` value was specified.");
  }

  public static write(data: DT): Promise<void> {
    if (this.missingPlainTextWarning && !data.getData(DataTypes.TEXT_PLAIN)) {
      (console.warn || console.log).call(console,
        "[clipboard.js] clipboard.write() was called without a "+
        "`text/plain` data type. On some platforms, this may result in an "+
        "empty clipboard. Call clipboard.suppressMissingPlainTextWarning() "+
        "to suppress this warning.");
    }

    // TODO: Allow fallback graph other than a single line.

    return new Promise<void>((resolve, reject) => {
      // Internet Explorer
      if (this.seemToBeInIE()) {
        if (this.writeIE(data)) {
          resolve()
        } else {
          reject(new Error("Copying failed, possibly because the user rejected it."));
        }
        return;
      }

      var tracker = this.execCopy(data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (this.DEBUG) (console.info || console.log).call(console, "Regular copy command succeeded.");
        resolve();
        return;
      }

      // Success detection on Edge is not possible, due to bugs in all 4
      // detection mechanisms we could try to use. Assume success.
      if (tracker.listenerCalled && navigator.userAgent.indexOf("Edge") > -1) {
        if (this.DEBUG) (console.info || console.log).call(console, "User agent contains \"Edge\". Blindly assuming success.");
        resolve();
        return;
      }

      // Fallback 1 for desktop Safari.
      tracker = this.copyUsingTempSelection(document.body, data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (this.DEBUG) (console.info || console.log).call(console, "Copied using temporary document.body selection.");
        resolve();
        return;
      }

      // Fallback 2 for desktop Safari. 
      tracker = this.copyUsingTempElem(data);
      if (tracker.listenerCalled && !tracker.listenerSetPlainTextFailed) {
        if (this.DEBUG) (console.info || console.log).call(console, "Copied using selection of temporary element added to DOM.");
        resolve();
        return;
      }

      // Fallback for iOS Safari.
      var text = data.getData(DataTypes.TEXT_PLAIN);
      if (text !== undefined) {
        if (this.DEBUG) (console.info || console.log).call(console, "Copied text using DOM.");
        resolve();
        return;
      }

      reject(new Error("Copy command failed."));
    });
  }

  static writeText(s: string): Promise<void> {
    var dt = new DT();
    dt.setData(DataTypes.TEXT_PLAIN, s);
    return this.write(dt);
  }

  public static readIE(): string|null {
    return (window as IEWindow).clipboardData.getData("Text");
  }

  static read(): Promise<DT> {
    return new Promise((resolve, reject) => {
      if (this.seemToBeInIE()) {
        var text = this.readIE();
        if (text === null) {
          reject(new Error("Could not read plain text from clipboard"));
        } else {
          resolve(DT.fromText(text));
        }
        return;
      };
      reject("Cannot read in any modern browsers.")
    });
  }

  static readText(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.seemToBeInIE()) {
        var text = this.readIE();
        if (text === null) {
          reject(new Error("Could not read plain text from clipboard"));
        } else {
          resolve(text);
        }
        return;
      };
      reject("Cannot read in any modern browsers.")
    });
  }

  // Legacy v1 API.
  static copy(obj: string|{[key:string]:string}|HTMLElement): Promise<void> {
    (console.warn || console.log).call(console, "[clipboard.js] The clipboard.copy() API is deprecated and may be removed in a future version. Please switch to clipboard.write() or clipboard.writeText().");

    return new Promise((resolve, reject) => {
      var data: DT;
      if (typeof obj === "string") {
        data = DT.fromText(obj);
      } else if (obj instanceof HTMLElement) {
        data = DT.fromElement(obj);
      } else if (obj instanceof Object) {
        data = DT.fromObject(obj);
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
    return this.readText();
  }
}

class Selection {
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

class FallbackTracker {
  public execCommandReturnedTrue: boolean = false;
  public listenerCalled: boolean = false;
  public listenerSetPlainTextFailed: boolean = false;
}

// TODO: Figure out how to expose ClipboardPolyfill as self.clipboard using
// WebPack?
declare var module: any;
module.exports = ClipboardPolyfill;
