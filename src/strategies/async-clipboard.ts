import {
  ClipboardItemInterface,
  ClipboardItemConstructor,
} from "../ClipboardItem/ClipboardItemInterface";

declare global {
  interface Window {
    ClipboardItem: ClipboardItemConstructor | undefined;
  }
  interface Clipboard {
    read(): Promise<ClipboardItemInterface>;
    write(data: ClipboardItemInterface[]): Promise<void>;
  }
}
