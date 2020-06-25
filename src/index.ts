export { write, writeText, read, readText } from "./clipboard-polyfill";
export { setDebugLog, suppressWarnings } from "./debug";
export { ClipboardItemPolyfill as ClipboardItem } from "./ClipboardItem/ClipboardItemPolyfill";
export type {
  ClipboardItems,
  ClipboardItemData,
  ClipboardItemConstructor,
  ClipboardItemDataType,
  ClipboardItemDelayedCallback,
  ClipboardItemInterface,
  PresentationStyle,
  ClipboardItemOptions,
} from "./ClipboardItem/spec";
