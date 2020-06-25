// type ClipboardItemDataType = string | Blob;
// type ClipboardItemData = Promise<ClipboardItemDataType>;

type PresentationStyle = "unspecified" | "inline" | "attachment";

interface ClipboardItemOptions {
  presentationStyle?: PresentationStyle;
}

export interface ClipboardItemDataMap {
  [type: string]: Blob;
}
export interface ClipboardItemAsResolvedText {
  [type: string]: string;
}

export interface ClipboardItemInterface {
  readonly types: string[];
  getType(type: string): Promise<Blob>;
  // The spec does *not* specifies this field as optional, but some initial
  // browser implementations of the async clipboard API don't have it. So we
  // mark it as optional. Safari 13.1 implements it. https://webkit.org/blog/10855/async-clipboard-api/
  readonly presentationStyle?: PresentationStyle;
}

export interface ClipboardItemConstructor {
  new (
    items: ClipboardItemDataMap,
    options?: ClipboardItemOptions
  ): ClipboardItemInterface;
}
