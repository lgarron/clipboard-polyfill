import { readText, writeText } from "../../implementations/text";
import { read, write } from "../../implementations/blob";
import { ClipboardItemPolyfill } from "../../ClipboardItem/ClipboardItemPolyfill";

// Create the `navigator.clipboard` object if it doesn't exist.
if (!navigator.clipboard) {
  (navigator as any).clipboard = {};
}

// Set/replace the implementations.
navigator.clipboard.read = read;
navigator.clipboard.readText = readText;
navigator.clipboard.write = write;
navigator.clipboard.writeText = writeText;

window.ClipboardItem = ClipboardItemPolyfill;
