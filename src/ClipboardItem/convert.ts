import { ClipboardItemObject, ClipboardItemInterface, ClipboardItemAsResolvedText } from "./ClipboardItemInterface";
import { ClipboardItemPolyfill } from "./ClipboardItemPolyfill";
import { TEXT_PLAIN } from "./data-types";

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

export function textToClipboardItem(text: string): ClipboardItemInterface {
  const items: ClipboardItemObject = {};
  items[TEXT_PLAIN] = stringToBlob(text, TEXT_PLAIN);
  return new ClipboardItemPolyfill(items);
}

export async function getTypeAsText(clipboardItem: ClipboardItemInterface, type: string): Promise<string> {
  const text: Blob = await clipboardItem.getType(type);
  return await blobToString(text);
}

export async function resolveItemsToText(data: ClipboardItemInterface): Promise<ClipboardItemAsResolvedText> {
  const items: ClipboardItemAsResolvedText = {};
  for (const type of data.types) {
    items[type] = await getTypeAsText(data, type);
    // Object.defineProperty(items, type, {
    //   value: data.getType(type),
    //   // tslint:disable-next-line: object-literal-sort-keys
    //   enumerable: true,
    // });
  }
  return items;
}
