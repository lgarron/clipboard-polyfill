import { ClipboardItemInterface, ClipboardItemDataMap } from "../ClipboardItem/ClipboardItemInterface";

export declare class GlobalClipboardItem implements ClipboardItemInterface {
  public readonly types: string[];
  constructor(items: ClipboardItemDataMap);
  public getType(type: string): Promise<Blob>;
}

declare global {
  interface Window {
      ClipboardItem: typeof GlobalClipboardItem | undefined;
  }
  interface Clipboard {
      read(): Promise<GlobalClipboardItem>;
      write(data: GlobalClipboardItem[]): Promise<void>;
  }
}

export async function clipboardItemToGlobalClipboardItem(data: ClipboardItemInterface): Promise<GlobalClipboardItem>  {
  const items: ClipboardItemDataMap = {};
  for (const type of data.types) {
    items[type] = await data.getType(type);
  }
  return new window.ClipboardItem!(items);
}
