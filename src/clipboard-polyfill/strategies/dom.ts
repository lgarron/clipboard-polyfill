import { StringItem } from "../ClipboardItem/convert";
import { TEXT_PLAIN } from "../ClipboardItem/data-types";
import { debugLog } from "../debug";

/******** Implementations ********/

interface FallbackTracker {
  success: boolean;
}

function copyListener(
  tracker: FallbackTracker,
  data: StringItem,
  e: ClipboardEvent,
): void {
  debugLog("listener called");
  tracker.success = true;
  // tslint:disable-next-line: forin
  for (var type in data) {
    var value = data[type];
    var clipboardData = e.clipboardData!;
    clipboardData.setData(type, value);
    if (type === TEXT_PLAIN && clipboardData.getData(type) !== value) {
      debugLog("setting text/plain failed");
      tracker.success = false;
    }
  }
  e.preventDefault();
}

export function execCopy(data: StringItem): boolean {
  var tracker: FallbackTracker = { success: false };
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
export function copyUsingTempSelection(
  e: HTMLElement,
  data: StringItem,
): boolean {
  selectionSet(e);
  var success = execCopy(data);
  selectionClear();
  return success;
}

// Create a temporary DOM element to select, so that `execCommand()` is not
// rejected.
export function copyUsingTempElem(data: StringItem): boolean {
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
export function copyTextUsingDOM(str: string): boolean {
  debugLog("copyTextUsingDOM");

  var tempElem = document.createElement("div");
  // Setting an individual property does not support `!important`, so we set the
  // whole style instead of just the `-webkit-user-select` property.
  tempElem.setAttribute("style", "-webkit-user-select: text !important");
  // Use shadow DOM if available.
  var spanParent: Node = tempElem;
  if (tempElem.attachShadow) {
    debugLog("Using shadow DOM.");
    spanParent = tempElem.attachShadow({ mode: "open" });
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
