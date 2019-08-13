import { blobToString, stringToBlob } from "./blob";
import { TEXT_PLAIN } from "./data-types";

// type ClipboardItemDataType = string | Blob;
// type ClipboardItemData = Promise<ClipboardItemDataType>;

// type PresentationStyle = "unspecified" | "inline" | "attachment";

// interface ClipboardItemOptions {
//   presentationStyle: PresentationStyle;
// }

export interface ClipboardItemObject {[type: string]: Blob; }
export interface ClipboardItemAsResolvedText {[type: string]: string; }

export class ClipboardItem {
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

export function textToClipboardItem(text: string): ClipboardItem {
  const items: ClipboardItemObject = {};
  items[TEXT_PLAIN] = stringToBlob(text);
  return new ClipboardItem(items);
}

export async function getTypeAsText(clipboardItem: ClipboardItem, type: string): Promise<string> {
  const text: Blob = await clipboardItem.getType(type);
  return await blobToString(text);
}

export async function resolveItemsToText(data: ClipboardItem): Promise<ClipboardItemAsResolvedText>  {
  const items: ClipboardItemAsResolvedText = {};
  for (const type of data.types) {
    items[type] = await getTypeAsText(data, type);
  }
  return items;
}
