
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

import { ClipboardItemConstructor, Clipboard, ClipboardItems } from "./ClipboardItem/spec";

const originalNavigator = (typeof navigator === "undefined" ? undefined : navigator);
const originalNavigatorClipboard: Clipboard | undefined = originalNavigator?.clipboard as any;
export const originalNavigatorClipboardRead: (() => Promise<ClipboardItems>) | undefined = originalNavigatorClipboard?.read?.bind(originalNavigatorClipboard);
export const originalNavigatorClipboardReadText: (() => Promise<string>) | undefined = originalNavigatorClipboard?.readText?.bind(originalNavigatorClipboard);
export const originalNavigatorClipboardWrite: ((data: ClipboardItems) => Promise<void>) | undefined = originalNavigatorClipboard?.write?.bind(originalNavigatorClipboard);
export const originalNavigatorClipboardWriteText: ((data: string) => Promise<void>) | undefined = originalNavigatorClipboard?.writeText?.bind(originalNavigatorClipboard);

// The spec specifies that this goes on `window`, not e.g. `globalThis`. It's not (currently) available in workers.
export const originalWindow = (typeof window === "undefined" ? undefined : window);
export const originalWindowClipboardItem: ClipboardItemConstructor | undefined = originalWindow?.ClipboardItem;
