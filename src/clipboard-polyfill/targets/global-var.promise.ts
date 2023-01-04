// Import `./globals` that the globals are cached before this runs.
import { readText, writeText } from "../implementations/text";
import { read, write } from "../implementations/blob";
import { ClipboardItemPolyfill } from "../ClipboardItem/ClipboardItemPolyfill";
import {
  ClipboardItemConstructor,
  ClipboardWithoutEventTarget,
} from "../ClipboardItem/spec";
import "../globals";
import { PromiseConstructor } from "../promise/es6-promise";
import { PromisePolyfillConstructor } from "../promise/polyfill";

declare global {
  var clipboardPolyfill: ClipboardWithoutEventTarget & {
    ClipboardItem: ClipboardItemConstructor;
  };
  var PromisePolyfill: PromiseConstructor;
}

window.clipboardPolyfill = {
  read: read,
  readText: readText,
  write: write,
  writeText: writeText,
  ClipboardItem: ClipboardItemPolyfill,
};

window.PromisePolyfill = PromisePolyfillConstructor;
