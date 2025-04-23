import { Mock, mock } from "bun:test";
import { setDebugLog } from "../clipboard-polyfill/debug";

const emptyFunction = () => {};
const asyncEmptyFunction = async () => {};

export function createDebugLogConsoleMock(): Mock<typeof console.log> {
  const consoleLogMock = mock(console.log);
  setDebugLog(consoleLogMock);
  return consoleLogMock;
}

interface DocumentMock {
  addEventListener: Mock<any>;
  removeEventListener: Mock<any>;
  execCommand: Mock<any>;
}

function assertEventNameOrCommandIsCopy(eventName: string) {
  if (eventName !== "copy") {
    throw new Error("Unexpected event name or command.");
  }
}

// TODO: Full return type.
export function createDocumentMock(): {
  documentMock: DocumentMock;
  eventMock: {
    clipboardData: { setData: Mock<any>; getData: Mock<any> };
    preventDefault: Mock<any>;
  };
} {
  const listeners: Set<any> = new Set(); // TODO

  // TODO: mock `DataTransfer`
  let textPlain: string | undefined;
  const eventMock = {
    clipboardData: {
      setData: mock((type: string, value: string) => {
        if (type !== "text/plain") {
          throw new Error("Unexpected type");
        }
        textPlain = value;
      }),
      getData: mock((type: string) => {
        if (type !== "text/plain") {
          throw new Error("Unexpected type");
        }
        return textPlain;
      }),
    },
    preventDefault: mock(emptyFunction), // TODO: Expose this to test that it gets called exactly once.
  };

  const documentMock = {
    addEventListener: mock((eventName, listener) => {
      assertEventNameOrCommandIsCopy(eventName);
      listeners.add(listener);
    }),
    removeEventListener: mock((eventName, listener) => {
      assertEventNameOrCommandIsCopy(eventName);
      listeners.delete(listener);
    }),
    execCommand: mock((command) => {
      assertEventNameOrCommandIsCopy(command);
      for (const listener of listeners) {
        listener(eventMock);
      }
    }),
  };
  (globalThis as any).document = documentMock;
  return { documentMock, eventMock };
}

export function createWriteTextMock(
  executor: (s: string) => Promise<void> = asyncEmptyFunction,
): Mock<typeof navigator.clipboard.writeText> {
  // biome-ignore lint/suspicious/noAssignInExpressions: DRY pattern.
  const navigatorMock = ((globalThis as any).navigator ??= {});
  // biome-ignore lint/suspicious/noAssignInExpressions: DRY pattern.
  const clipboardMock = (navigatorMock.clipboard ??= {});
  const writeTextMock = mock(executor);
  clipboardMock.writeText = writeTextMock;
  return writeTextMock;
}
