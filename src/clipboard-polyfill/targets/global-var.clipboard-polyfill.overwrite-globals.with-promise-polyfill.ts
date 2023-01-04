// Import `./globals` that the globals are cached before this runs.
import { readText, writeText } from "../implementations/text";
import { read, write } from "../implementations/blob";
import { ClipboardItemPolyfill } from "../ClipboardItem/ClipboardItemPolyfill";
import {
  ClipboardItemConstructor,
  ClipboardWithoutEventTarget,
} from "../ClipboardItem/spec";
import "../globals";

declare global {
  var clipboardPolyfill: ClipboardWithoutEventTarget & {
    ClipboardItem: ClipboardItemConstructor;
  };
}

window.clipboardPolyfill = {
  read: read,
  readText: readText,
  write: write,
  writeText: writeText,
  ClipboardItem: ClipboardItemPolyfill,
};
