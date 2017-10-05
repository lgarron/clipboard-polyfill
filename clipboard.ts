"use strict";

export class clipboard {
  private static copyListener(tracker: clipboard.FallbackTracker, data: clipboard.DT, e: ClipboardEvent): void {
    tracker.tryFallback = false;
    data.forEach((value: string, key: string) => {
      e.clipboardData.setData(key, value);
    });
    e.preventDefault();
  }

  private static execCopy(listener: (e: ClipboardEvent) => void): boolean {
    var result = false;
    document.addEventListener("copy", listener);
    try {
      result = document.execCommand("copy");
    } catch (e) {
      // TODO: Expose to Promise.
      return false;
    } finally {
      document.removeEventListener("copy", listener);
    }
    return result;
  }

  // Uses shadow DOM.
  private static copyTextUsingDOM(str: string): boolean {
    var tempElem = document.createElement("div");
    var shadowRoot = tempElem.attachShadow({mode: "open"});
    document.body.appendChild(tempElem);

    var span = document.createElement("span");
    span.textContent = str;
    span.style.whiteSpace = "pre-wrap";
    shadowRoot.appendChild(span);
    clipboard.Selection.select(span);

    var result = document.execCommand("copy");

    clipboard.Selection.clear();
    document.body.removeChild(tempElem);

    return result;
  }

  public static write(data: clipboard.DT): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var tracker = new clipboard.FallbackTracker();
      var result = this.execCopy(this.copyListener.bind(this, tracker, data));
      if (result) {
        resolve();
      } else {
        if (tracker.tryFallback && this.copyTextUsingDOM(<string>data.getData("text/plain"))) {
          resolve();
        } else {
          reject(new Error("Copy command failed (or you're using Edge)."));
        }
      }
    });
  }

  static writeText(s: string): Promise<void> {
    var dt = new clipboard.DT();
    dt.setData("text/plain", s);
    return clipboard.write(dt);
  }

  static read(): Promise<clipboard.DT> {
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }

  static readText(): Promise<string> {
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }

  // Legacy v1 API.
  static copy(obj: string|{[key:string]:string}|Element): Promise<void> {
    (console.warn || console.log).call(console, "[clipboard.js] The clipboard.copy() API is deprecated and may be removed in a future version. Please switch to clipboard.write() or clipboard.writeText().");

    return new Promise((resolve, reject) => {
      var data: {[key:string]:string};
      if (typeof obj === "string") {
        data = {"text/plain": obj};
      } else if (obj instanceof Element) {
        data = {"text/html": new XMLSerializer().serializeToString(obj)};
      } else if (obj instanceof Object){
        data = obj;
      } else {
        reject("Invalid data type. Must be string, DOM node, or an object mapping MIME types to strings.");
        return;
      }
      this.write(clipboard.DT.fromObject(data));
    });
  }

  // Legacy v1 API.
  static paste(): Promise<string> {
    (console.warn || console.log).call(console, "[clipboard.js] The clipboard.paste() API is deprecated and may be removed in a future version. Please switch to clipboard.read() or clipboard.readText().");
    return new Promise((resolve, reject) => reject("Cannot read in any modern browsers. IE11 pasting is not implemented yet."));
  }
}

export namespace clipboard {
  export class DT {
    private m: Map<string, string> = new Map<string, string>();

    setData(type: string, value: string): void {
      this.m.set(type, value);
    }

    getData(type: string): string | undefined {
      return this.m.get(type);
    }

    // TODO: Provide an iterator consistent with DataTransfer.
    forEach(f: (value: string, key: string) => void): void {
      return this.m.forEach(f);
    }

    static fromObject(obj: {[key:string]:string}) {
      var dt = new DT();
      for (var key in obj) {
        dt.setData(key, obj[key]);
      }
      return dt;
    }
  }

  export class Selection {
    static select(elem: Element): void {
      var sel = document.getSelection();
      var range = document.createRange();
      range.selectNodeContents(elem);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    static clear(): void {
      var sel = document.getSelection();
      sel.removeAllRanges();
    }
  }

  export class FallbackTracker {
    public tryFallback: boolean = true;
  }
}

// document.addEventListener("copy")