import { ClipboardItemInterface, ClipboardItemObject } from "./ClipboardItemInterface";

export class ClipboardItemPolyfill implements ClipboardItemInterface {
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

export function hasItemWithType(clipboardItems: ClipboardItemInterface[], typeName: string): boolean {
  for (const item of clipboardItems) {
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
