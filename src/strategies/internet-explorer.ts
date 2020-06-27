import { originalWindow } from "../globals";

interface IEWindow extends Window {
  clipboardData: {
    setData: (key: string, value: string) => boolean;
    // Always results in a string: https://msdn.microsoft.com/en-us/library/ms536436(v=vs.85).aspx
    getData: (key: string) => string;
  };
}

const ieWindow = (originalWindow as unknown) as IEWindow;

export function seemToBeInIE(): boolean {
  return (
    typeof ClipboardEvent === "undefined" &&
    typeof ieWindow.clipboardData !== "undefined" &&
    typeof ieWindow.clipboardData.setData !== "undefined"
  );
}

export function writeTextIE(text: string): boolean {
  // IE supports text or URL, but not HTML: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
  // TODO: Write URLs to `text/uri-list`? https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
  return ieWindow.clipboardData.setData("Text", text);
}

// Returns "" if the read failed, e.g. because the user rejected the permission.
export async function readTextIE(): Promise<string> {
  const text = ieWindow.clipboardData.getData("Text");
  if (text === "") {
    throw new Error(
      "Empty clipboard or could not read plain text from clipboard"
    );
  }
  return text;
}
