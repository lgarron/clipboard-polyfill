import { blobToString, stringToBlob } from "./blob";
import { TEXT_PLAIN } from "./data-types";

// type ClipboardItemDataType = string | Blob;
// type ClipboardItemData = Promise<ClipboardItemDataType>;

// type PresentationStyle = "unspecified" | "inline" | "attachment";

// interface ClipboardItemOptions {
//   presentationStyle: PresentationStyle;
// }

export interface ClipboardItemObject { [type: string]: Blob; }
export interface ClipboardItemAsResolvedText { [type: string]: string; }

export interface ClipboardItemInterface {
  readonly types: string[];
  getType(type: string): Promise<Blob>;
}

export class PolyfillClipboardItem implements ClipboardItemInterface {
  public readonly types: string[];
  public constructor(private items: ClipboardItemObject) {
    this.types = Object.keys(items);
  }

  public async getType(type: string): Promise<Blob> {
    return this.items[type];
  }

  // public readonly presentationStyle: PresentationStyle;
  // public readonly lastModified: number;
  // public readonly delayed: boolean;
  // public createDelayed(items: {[type: string]: ClipboardItemData}, options?: ClipboardItemOptions) {}
}

export function textToClipboardItem(text: string): ClipboardItemInterface {
  const items: ClipboardItemObject = {};
  items[TEXT_PLAIN] = stringToBlob(text, TEXT_PLAIN);
  return new PolyfillClipboardItem(items);
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

export function hasItemWithType(clipboardItems: ClipboardItemInterface[], typeName: string): boolean {
  for (const item of clipboardItems) {
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
