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