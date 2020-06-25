
// type ClipboardItemDataType = string | Blob;
// type ClipboardItemData = Promise<ClipboardItemDataType>;

// type PresentationStyle = "unspecified" | "inline" | "attachment";

// interface ClipboardItemOptions {
//   presentationStyle: PresentationStyle;
// }

export interface ClipboardItemDataMap { [type: string]: Blob; }
export interface ClipboardItemAsResolvedText { [type: string]: string; }

export interface ClipboardItemInterface {
  readonly types: string[];
  getType(type: string): Promise<Blob>;
}

export interface ClipboardItemConstructor {
  new(items: ClipboardItemDataMap): ClipboardItemInterface;
}
