import { ClipboardItemPolyfill } from "../../ClipboardItem/ClipboardItemPolyfill";
import { read, write } from "../../implementations/blob";
import { readText, writeText } from "../../implementations/text";

// Create the `navigator.clipboard` object if it doesn't exist.
if (!navigator.clipboard) {
  (navigator as any).clipboard = {};
}

// Set/replace the implementations.
navigator.clipboard.read = read as any;
navigator.clipboard.readText = readText;
navigator.clipboard.write = write;
navigator.clipboard.writeText = writeText;

// @ts-ignore
window.ClipboardItem = ClipboardItemPolyfill;
