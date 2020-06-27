import { StringItem } from "../ClipboardItem/convert";
import { TEXT_PLAIN } from "../ClipboardItem/data-types";
import { debugLog } from "../debug";

/******** Implementations ********/

class FallbackTracker {
  public success: boolean = false;
}

function copyListener(
  tracker: FallbackTracker,
  data: StringItem,
  e: ClipboardEvent,
): void {
  debugLog("listener called");
  tracker.success = true;
  // tslint:disable-next-line: forin
  for (const type in data) {
    const value = data[type];
    const clipboardData = e.clipboardData!;
    clipboardData.setData(type, value);
    if (type === TEXT_PLAIN && clipboardData.getData(type) !== value) {
      debugLog("setting text/plain failed");
      tracker.success = false;
    }
  }
  e.preventDefault();
}

export function execCopy(data: StringItem): boolean {
  const tracker = new FallbackTracker();
  const listener = copyListener.bind(this, tracker, data);

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
  const success = execCopy(data);
  selectionClear();
  return success;
}

// Create a temporary DOM element to select, so that `execCommand()` is not
// rejected.
export function copyUsingTempElem(data: StringItem): boolean {
  const tempElem = document.createElement("div");
  // Setting an individual property does not support `!important`, so we set the
  // whole style instead of just the `-webkit-user-select` property.
  tempElem.setAttribute("style", "-webkit-user-select: text !important");
  // Place some text in the elem so that Safari has something to select.
  tempElem.textContent = "temporary element";
  document.body.appendChild(tempElem);

  const success = copyUsingTempSelection(tempElem, data);

  document.body.removeChild(tempElem);
  return success;
}

// Uses shadow DOM.
export function copyTextUsingDOM(str: string): boolean {
  debugLog("copyTextUsingDOM");

  const tempElem = document.createElement("div");
  // Setting an individual property does not support `!important`, so we set the
  // whole style instead of just the `-webkit-user-select` property.
  tempElem.setAttribute("style", "-webkit-user-select: text !important");
  // Use shadow DOM if available.
  let spanParent: Node = tempElem;
  if (tempElem.attachShadow) {
    debugLog("Using shadow DOM.");
    spanParent = tempElem.attachShadow({ mode: "open" });
  }

  const span = document.createElement("span");
  span.innerText = str;

  spanParent.appendChild(span);
  document.body.appendChild(tempElem);
  selectionSet(span);

  const result = document.execCommand("copy");

  selectionClear();
  document.body.removeChild(tempElem);

  return result;
}

/******** Selection ********/

function selectionSet(elem: Element): void {
  const sel = document.getSelection();
  if (sel) {
    const range = document.createRange();
    range.selectNodeContents(elem);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function selectionClear(): void {
  const sel = document.getSelection();
  if (sel) {
    sel.removeAllRanges();
  }
}
