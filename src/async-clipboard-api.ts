import {ClipboardItemObject} from "./clipboard-item";

declare class GlobalClipboardItem {
  constructor(items: ClipboardItemObject);
}

declare global {
  interface Window {
      ClipboardItem: GlobalClipboardItem | undefined;
  }
}

export async function writeText(item: string) {
  const globalClipboardItem: GlobalClipboardItem | undefined = window.ClipboardItem;
  if (!globalClipboardItem) {
    throw new Error("could not construct `ClipboardItem`");
  }
  // tslint:disable-next-line: no-console
  console.log(new globalClipboardItem({}));
}
