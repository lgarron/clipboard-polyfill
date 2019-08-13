import {ClipboardItemInterface, ClipboardItemObject} from "./clipboard-item";

export declare class GlobalClipboardItem implements ClipboardItemInterface {
  public readonly types: string[];
  constructor(items: ClipboardItemObject);
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
  const items: ClipboardItemObject = {};
  for (const type of data.types) {
    items[type] = await data.getType(type);
  }
  // tslint:disable-next-line: no-console
  console.log(items);
  return new window.ClipboardItem!(items);
}
