import { equal } from "node:assert";
import type { ClipboardWithoutEventTarget } from "../clipboard-polyfill/ClipboardItem/spec";

const mockStringClipboard = new (class MockStringClipboard {
  value: string = "";
  setText(s: string) {
    this.value = s;
  }
  getText(): string {
    return this.value;
  }
})();

function unimplemented(): any {
  throw new Error("unimplemented");
}

globalThis.navigator ??= {} as any;
(globalThis.navigator as any).clipboard ??= {
  writeText: async (s) => mockStringClipboard.setText(s),
  readText: async (): Promise<string> => mockStringClipboard.getText(),
  read: unimplemented,
  write: unimplemented,
} satisfies ClipboardWithoutEventTarget;

// This needs to happen after the mocks are set up.
const { readText, writeText } = await import(
  "../clipboard-polyfill/entries/es6/clipboard-polyfill.es6"
);

mockStringClipboard.setText("hello world");
equal("hello world", await readText());
await writeText("new text");
equal("new text", await readText());
