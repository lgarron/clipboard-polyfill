import { ClipboardItemPolyfill } from "./ClipboardItemPolyfill";
import { TEXT_PLAIN } from "./data-types";
import { ClipboardItemInterface, ClipboardItemOptions } from "./spec";
import { originalWindowClipboardItem } from "../globals";

export function stringToBlob(type: string, str: string): Blob {
  return new Blob([str], {
    type,
  });
}

export async function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      const result = fileReader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject("could not convert blob to string");
      }
    });
    fileReader.readAsText(blob);
  });
}

export async function clipboardItemToGlobalClipboardItem(
  clipboardItem: ClipboardItemInterface
): Promise<ClipboardItemInterface> {
  // Note that we use `Blob` instead of `ClipboardItemDataType`. This is because
  // Chrome 83 can only accept `Blob` (not `string`). The return value of
  // `getType()` is already `Blob` per the spec, so this is simple for us.
  const items: { [type: string]: Blob } = {};
  for (const type of clipboardItem.types) {
    items[type] = await clipboardItem.getType(type);
  }
  const options: ClipboardItemOptions = {};
  if (clipboardItem.presentationStyle) {
    options.presentationStyle = clipboardItem.presentationStyle;
  }
  return new originalWindowClipboardItem!(items, options);
}

export function textToClipboardItem(text: string): ClipboardItemInterface {
  const items: { [type: string]: Blob } = {};
  items[TEXT_PLAIN] = stringToBlob(text, TEXT_PLAIN);
  return new ClipboardItemPolyfill(items);
}

export async function getTypeAsString(
  clipboardItem: ClipboardItemInterface,
  type: string
): Promise<string> {
  const text: Blob = await clipboardItem.getType(type);
  return await blobToString(text);
}

export interface StringItem {
  [type: string]: string;
}

export async function toStringItem(
  data: ClipboardItemInterface
): Promise<StringItem> {
  const items: StringItem = {};
  for (const type of data.types) {
    items[type] = await getTypeAsString(data, type);
    // Object.defineProperty(items, type, {
    //   value: data.getType(type),
    //   // tslint:disable-next-line: object-literal-sort-keys
    //   enumerable: true,
    // });
  }
  return items;
}
