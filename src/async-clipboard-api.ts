import {ClipboardItem, ClipboardItemObject} from "./clipboard-item";

declare class GlobalClipboardItem {
  constructor(items: ClipboardItemObject);
}

declare global {
  interface Window {
      ClipboardItem: typeof GlobalClipboardItem | undefined;
  }
  interface Clipboard {
      read(): Promise<ClipboardItem>;
      write(data: ClipboardItem): Promise<void>;
  }
}

export async function writeText(item: string) {
  const globalClipboardItem = window.ClipboardItem;
  if (!globalClipboardItem) {
    throw new Error("could not construct `ClipboardItem`");
  }
  // tslint:disable-next-line: no-console
  console.log(new globalClipboardItem({}));
}
