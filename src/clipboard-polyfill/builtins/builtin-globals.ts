// We cache the references so that callers can do the following without causing infinite recursion/bugs:
//
//     import * as clipboard from "clipboard-polyfill";
//     navigator.clipboard = clipboard;
//
//     import { ClipboardItem } from "clipboard-polyfill";
//     window.ClipboardItem = clipboard;
//
// Note that per the spec:
//
// - is *not* possible to overwrite `navigator.clipboard`. https://www.w3.org/TR/clipboard-apis/#navigator-interface
// - it *may* be possible to overwrite `window.ClipboardItem`.
//
// Chrome 83 and Safari 13.1 match this. We save the original
// `navigator.clipboard` anyhow, because 1) it doesn't cost more code (in fact,
// it probably saves code), and 2) just in case an unknown/future implementation
// allows overwriting `navigator.clipboard` like this.

import type {
  ClipboardEventTarget,
  ClipboardItemConstructor,
  ClipboardItems,
} from "../ClipboardItem/spec";
import type { PromiseConstructor } from "../promise/es6-promise";
import { getPromiseConstructor } from "./promise-constructor";
import { originalWindow } from "./window-globalThis";

var originalNavigator =
  typeof navigator === "undefined" ? undefined : navigator;
var originalNavigatorClipboard: ClipboardEventTarget | undefined =
  originalNavigator?.clipboard as any;
export var originalNavigatorClipboardRead:
  | (() => Promise<ClipboardItems>)
  | undefined = originalNavigatorClipboard?.read?.bind(
  originalNavigatorClipboard,
);
export var originalNavigatorClipboardReadText:
  | (() => Promise<string>)
  | undefined = originalNavigatorClipboard?.readText?.bind(
  originalNavigatorClipboard,
);
export var originalNavigatorClipboardWrite:
  | ((data: ClipboardItems) => Promise<void>)
  | undefined = originalNavigatorClipboard?.write?.bind(
  originalNavigatorClipboard,
);
export var originalNavigatorClipboardWriteText:
  | ((data: string) => Promise<void>)
  | undefined = originalNavigatorClipboard?.writeText?.bind(
  originalNavigatorClipboard,
);

// The spec specifies that this goes on `window`, not e.g. `globalThis`. It's not (currently) available in workers.
export var originalWindowClipboardItem: ClipboardItemConstructor | undefined =
  originalWindow?.ClipboardItem;

export var promiseConstructor: PromiseConstructor = getPromiseConstructor();
