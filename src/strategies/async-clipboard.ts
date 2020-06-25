import { ClipboardItemConstructor, ClipboardItem } from "../ClipboardItem/spec";

declare global {
  interface Window {
    ClipboardItem: ClipboardItemConstructor | undefined;
  }
  interface Clipboard {
    read(): Promise<ClipboardItem>;
    write(data: ClipboardItem[]): Promise<void>;
  }
}
