import {
  ClipboardItemConstructor,
  ClipboardItemInterface,
} from "../ClipboardItem/spec";

declare global {
  interface Window {
    ClipboardItem: ClipboardItemConstructor | undefined;
  }
  interface Clipboard {
    read(): Promise<ClipboardItemInterface>;
    write(data: ClipboardItemInterface[]): Promise<void>;
  }
}
