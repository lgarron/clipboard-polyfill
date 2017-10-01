"use strict";

export class clipboard {
  private static copyListener(data: clipboard.DT, e: ClipboardEvent): void {
    data.forEach((value: string, key: string) => {
      console.log(key, value);
      e.clipboardData.setData(key, value);
    });
    e.preventDefault();
  }

  private static execCopy(listener: (e: ClipboardEvent) => void): boolean {
    var result = false;
    document.addEventListener("copy", listener);
    try {
      result = document.execCommand("copy");
    } finally {
      document.removeEventListener("copy", listener);
    }
    return result;
  }

  private static writePromise(data: clipboard.DT, resolve: () => void, reject: (e: Error) => void) {
    var result = this.execCopy(this.copyListener.bind(this, data));
    if (result) {
      resolve();
    } else {
      reject(new Error("Copy command failed."));
    }
  }

  static write(data: clipboard.DT): Promise<void> {
    var bogusSelection = clipboard.SafariWorkaround.setup();
    var p = new Promise<void>(this.writePromise.bind(this, data));
    clipboard.SafariWorkaround.teardown(bogusSelection);
    return p;
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
  }

  export class Selection {
    static select(elem: Element): void {
      var sel = document.getSelection();
      var range = document.createRange();
      range.selectNodeContents(elem);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  export class SafariWorkaround {
    static setup(): boolean {
      if (!document.queryCommandEnabled("copy") && document.getSelection().isCollapsed) {
        Selection.select(document.body)
        return true;
      }
      return false;
    }

    static teardown(bogusSelection: boolean): void {
      if (bogusSelection) {
        window.getSelection().removeAllRanges();
      }
    }
  }
}

function test() {
  var m = new clipboard.DT();
  m.setData("text/plain", "hi");
  clipboard.write(m).then(console.log, console.error);
}

// document.addEventListener("copy")