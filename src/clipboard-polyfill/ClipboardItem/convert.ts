import { ClipboardItemPolyfill } from "./ClipboardItemPolyfill";
import { TEXT_PLAIN } from "./data-types";
import { ClipboardItemInterface, ClipboardItemOptions } from "./spec";
import {
  promiseConstructor,
  originalWindowClipboardItem,
} from "../builtins/builtin-globals";
import { promiseRecordMap } from "../promise/promise-compat";

export function stringToBlob(type: string, str: string): Blob {
  return new Blob([str], {
    type,
  });
}

export function blobToString(blob: Blob): Promise<string> {
  return new promiseConstructor((resolve, reject) => {
    var fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      var result = fileReader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject("could not convert blob to string");
      }
    });
    fileReader.readAsText(blob);
  });
}

export function clipboardItemToGlobalClipboardItem(
  clipboardItem: ClipboardItemInterface,
): Promise<ClipboardItemInterface> {
  // Note that we use `Blob` instead of `ClipboardItemDataType`. This is because
  // Chrome 83 can only accept `Blob` (not `string`). The return value of
  // `getType()` is already `Blob` per the spec, so this is simple for us.
  return promiseRecordMap(clipboardItem.types, function (type: string) {
    return clipboardItem.getType(type);
  }).then((items: Record<string, Blob>) => {
    return new promiseConstructor((resolve, reject) => {
      var options: ClipboardItemOptions = {};
      if (clipboardItem.presentationStyle) {
        options.presentationStyle = clipboardItem.presentationStyle;
      }
      if (originalWindowClipboardItem) {
        resolve(new originalWindowClipboardItem(items, options));
      } else {
        reject("window.ClipboardItem is not defined");
      }
    });
  });
}

export function textToClipboardItem(text: string): ClipboardItemInterface {
  var items: { [type: string]: Blob } = {};
  items[TEXT_PLAIN] = stringToBlob(text, TEXT_PLAIN);
  return new ClipboardItemPolyfill(items);
}

export function getTypeAsString(
  clipboardItem: ClipboardItemInterface,
  type: string,
): Promise<string> {
  return clipboardItem.getType(type).then((text: Blob) => {
    return blobToString(text);
  });
}

export interface StringItem {
  [type: string]: string;
}

export function toStringItem(
  data: ClipboardItemInterface,
): Promise<StringItem> {
  return promiseRecordMap(data.types, function (type: string) {
    return getTypeAsString(data, type);
  });
}
