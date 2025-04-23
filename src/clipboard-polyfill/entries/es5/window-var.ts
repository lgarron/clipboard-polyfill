import { ClipboardItemPolyfill } from "../../ClipboardItem/ClipboardItemPolyfill";
import {
  ClipboardItemConstructor,
  ClipboardWithoutEventTarget,
} from "../../ClipboardItem/spec";
import { setDebugLog, suppressWarnings } from "../../debug";
import { read, write } from "../../implementations/blob";
import { readText, writeText } from "../../implementations/text";

declare global {
  var clipboard: ClipboardWithoutEventTarget & {
    ClipboardItem: ClipboardItemConstructor;
    setDebugLog: typeof setDebugLog;
    suppressWarnings: typeof suppressWarnings;
  };
}

window.clipboard = {
  read: read,
  readText: readText,
  write: write,
  writeText: writeText,
  ClipboardItem: ClipboardItemPolyfill,
  setDebugLog: setDebugLog,
  suppressWarnings: suppressWarnings,
};
