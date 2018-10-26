import {DT, suppressDTWarnings} from "./DT";

// Debug log strings should be short, since they are copmiled into the production build.
// TODO: Compile debug logging code out of production builds?
var debugLog: (s: string) => void = function(s: string) {};
var showWarnings = true;
// Workaround for:
// - IE9 (can't bind console functions directly), and
// - Edge Issue #14495220 (referencing `console` without F12 Developer Tools can cause an exception)
var warnOrLog = function() {
  (console.warn || console.log).apply(console, arguments);
};
var warn = warnOrLog.bind("[clipboard-polyfill]");

var TEXT_PLAIN = "text/plain";

declare global {
  interface Navigator {
    clipboard: {
      writeText?: (s: string) => Promise<void>;
      readText?: () => Promise<string>;
    };
  }
}

export {DT};

export function setDebugLog(f: (s: string) => void): void {
  debugLog = f;
}

export function suppressWarnings() {
  showWarnings = false;
  suppressDTWarnings();
}

export async function write(data: DT): Promise<void> {
  if (showWarnings && !data.getData(TEXT_PLAIN)) {
    warn("clipboard.write() was called without a "+
      "`text/plain` data type. On some platforms, this may result in an "+
      "empty clipboard. Call clipboard.suppressWarnings() "+
      "to suppress this warning.");
  }

  // Internet Explorer
  if (seemToBeInIE()) {
    if (writeIE(data)) {
      return;
    } else {
      throw "Copying failed, possibly because the user rejected it.";
    }
  }

  if (execCopy(data)) {
    debugLog("regular execCopy worked");
    return;
  }

  // Success detection on Edge is not possible, due to bugs in all 4
  // detection mechanisms we could try to use. Assume success.
  if (navigator.userAgent.indexOf("Edge") > -1) {
    debugLog("UA \"Edge\" => assuming success");
    return;
  }

  // Fallback 1 for desktop Safari.
  if (copyUsingTempSelection(document.body, data)) {
    debugLog("copyUsingTempSelection worked");
    return;
  }

  // Fallback 2 for desktop Safari.
  if (copyUsingTempElem(data)) {
    debugLog("copyUsingTempElem worked");
    return;
  }

  // Fallback for iOS Safari.
  var text = data.getData(TEXT_PLAIN);
  if (text !== undefined && copyTextUsingDOM(text)) {
    debugLog("copyTextUsingDOM worked");
    return;
  }

  throw "Copy command failed.";
}

export async function writeText(s: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    debugLog("Using `navigator.clipboard.writeText()`.");
    return navigator.clipboard.writeText(s);
  }
  return write(DTFromText(s));
}

export async function read(): Promise<DT> {
  return DTFromText(await readText());
}

export async function readText(): Promise<string> {
  if (navigator.clipboard && navigator.clipboard.readText) {
    debugLog("Using `navigator.clipboard.readText()`.");
    return navigator.clipboard.readText();
  }
  if (seemToBeInIE()) {
    debugLog("Reading text using IE strategy.");
    return readIE();
  }
  throw "Read is not supported in your browser.";
}

var useStarShown = false;
function useStar(): void {
  if (useStarShown) {
    return;
  }
  if (showWarnings) {
    warn("The deprecated default object of `clipboard-polyfill` was called. Please switch to `import * as clipboard from \"clipboard-polyfill\"` and see https://github.com/lgarron/clipboard-polyfill/issues/101 for more info.");
  }
  useStarShown = true;
}

export default class ClipboardPolyfillDefault {
  public static readonly DT = DT;
  public static setDebugLog(f: (s: string) => void): void {
    useStar();
    return setDebugLog(f);
  }
  public static suppressWarnings() {
    useStar();
    return suppressWarnings();
  }
  public static async write(data: DT): Promise<void> {
    useStar();
    return write(data);
  }
  public static async writeText(s: string): Promise<void> {
    useStar();
    return writeText(s);
  }
  public static async read(): Promise<DT> {
    useStar();
    return read();
  }
  public static async readText(): Promise<string> {
    useStar();
    return readText();
  }
}

/******** Implementations ********/

class FallbackTracker {
  public success: boolean = false;
}

function copyListener(tracker: FallbackTracker, data: DT, e: ClipboardEvent): void {
  debugLog("listener called");
  tracker.success = true;
  data.forEach((value: string, key: string) => {
    e.clipboardData.setData(key, value);
    if (key === TEXT_PLAIN && e.clipboardData.getData(key) != value) {
      debugLog("setting text/plain failed");
      tracker.success = false;
    }
  });
  e.preventDefault();
}

function execCopy(data: DT): boolean {
  var tracker = new FallbackTracker();
  var listener = copyListener.bind(this, tracker, data);

  document.addEventListener("copy", listener);
  try {
    // We ignore the return value, since FallbackTracker tells us whether the
    // listener was called. It seems that checking the return value here gives
    // us no extra information in any browser.
    document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", listener);
  }
  return tracker.success;
}

// Temporarily select a DOM element, so that `execCommand()` is not rejected.
function copyUsingTempSelection(e: HTMLElement, data: DT): boolean {
  selectionSet(e);
  var success = execCopy(data);
  selectionClear();
  return success;
}

// Create a temporary DOM element to select, so that `execCommand()` is not
// rejected.
function copyUsingTempElem(data: DT): boolean {
  var tempElem = document.createElement("div");
  // Setting an individual property does not support `!important`, so we set the
  // whole style instead of just the `-webkit-user-select` property.
  tempElem.setAttribute("style", "-webkit-user-select: text !important");
  // Place some text in the elem so that Safari has something to select.
  tempElem.textContent = "temporary element";
  document.body.appendChild(tempElem);

  var success = copyUsingTempSelection(tempElem, data);

  document.body.removeChild(tempElem);
  return success;
}

// Uses shadow DOM.
function copyTextUsingDOM(str: string): boolean {
  debugLog("copyTextUsingDOM");

  var tempElem = document.createElement("div");
  // Setting an individual property does not support `!important`, so we set the
  // whole style instead of just the `-webkit-user-select` property.
  tempElem.setAttribute("style", "-webkit-user-select: text !important");
  // Use shadow DOM if available.
  var spanParent: Node = tempElem;
  if (tempElem.attachShadow) {
    debugLog("Using shadow DOM.");
    spanParent = tempElem.attachShadow({mode: "open"});
  }

  var span = document.createElement("span");
  span.innerText = str;

  spanParent.appendChild(span);
  document.body.appendChild(tempElem);
  selectionSet(span);

  var result = document.execCommand("copy");

  selectionClear();
  document.body.removeChild(tempElem);

  return result;
}

/******** Selection ********/

function selectionSet(elem: Element): void {
  var sel = document.getSelection();
  if (sel) {
    var range = document.createRange();
    range.selectNodeContents(elem);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function selectionClear(): void {
  var sel = document.getSelection();
  if (sel) {
    sel.removeAllRanges();
  }
}

/******** Convenience ********/

function DTFromText(s: string): DT {
  var dt = new DT();
  dt.setData(TEXT_PLAIN, s);
  return dt;
}

/******** Internet Explorer ********/

interface IEWindow extends Window {
  clipboardData: {
    setData: (key: string, value: string) => boolean;
    // Always results in a string: https://msdn.microsoft.com/en-us/library/ms536436(v=vs.85).aspx
    getData: (key: string) => string;
  }
}

function seemToBeInIE(): boolean {
  return typeof ClipboardEvent === "undefined" &&
         typeof (window as IEWindow).clipboardData !== "undefined" &&
         typeof (window as IEWindow).clipboardData.setData !== "undefined";
}

function writeIE(data: DT): boolean {
  // IE supports text or URL, but not HTML: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
  // TODO: Write URLs to `text/uri-list`? https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
  var text = data.getData(TEXT_PLAIN);
  if (text !== undefined) {
    return (window as IEWindow).clipboardData.setData("Text", text);
  }

  throw ("No `text/plain` value was specified.");
}

// Returns "" if the read failed, e.g. because the user rejected the permission.
async function readIE(): Promise<string> {
  var text = (window as IEWindow).clipboardData.getData("Text");
  if (text === "") {
    throw "Empty clipboard or could not read plain text from clipboard";
  }
  return text;
}
