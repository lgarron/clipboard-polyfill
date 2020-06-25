// This should be a `.d.ts` file, but we need to make it `.ts` (or Rollup won't include it in the output).

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
