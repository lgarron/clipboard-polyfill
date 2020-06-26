
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

import { ClipboardItemConstructor } from "./ClipboardItem/spec";

export const originalNavigatorClipboard: Clipboard | undefined = navigator.clipboard;

// The spec specifies that this goes on `window`, not e.g. `globalThis`. It's not (currently) available in workers.s
export const originalWindowClipboardItem: ClipboardItemConstructor | undefined = window.ClipboardItem;
