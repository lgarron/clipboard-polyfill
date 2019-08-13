// type ClipboardItemDataType = string | Blob;
// type ClipboardItemData = Promise<ClipboardItemDataType>;

// type PresentationStyle = "unspecified" | "inline" | "attachment";

// interface ClipboardItemOptions {
//   presentationStyle: PresentationStyle;
// }

export interface ClipboardItemObject {[type: string]: Blob; }

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
