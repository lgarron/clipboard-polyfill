"use strict";

export class clipboard {
  private static copyListener(data: clipboard.DT, e: ClipboardEvent): void {
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
    } finally {
      document.removeEventListener("copy", listener);
    }
    return result;
  }

  private static writePromise(data: clipboard.DT): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var result = this.execCopy(this.copyListener.bind(this, data));
      if (result) {
        resolve();
      } else {
        reject(new Error("Copy command failed."));
      }
    });
  }

  static writeWithWorkaround(data: clipboard.DT, workaround: clipboard.Workaround): Promise<void> {
    var p = this.writePromise(data);
    workaround.teardown();
    return p;
  }

  static write(data: clipboard.DT): Promise<void> {
    if (clipboard.SafariWorkaround.shouldTry()) {
      return this.writeWithWorkaround(data, new clipboard.SafariWorkaround());
    } else {
      return this.writePromise(data);
    }
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
  }

  export interface Workaround {
    teardown(): void;
  }

  export class SafariWorkaround implements Workaround {
    constructor() {
      // TODO: Save exact selection
      Selection.select(document.body);
    }

    teardown(): void {
      window.getSelection().removeAllRanges();
    }

    static shouldTry(): boolean {
      return !document.queryCommandEnabled("copy") && document.getSelection().isCollapsed
    }
  }
}

function test() {
  var m = new clipboard.DT();
  m.setData("text/plain", "hi");
  clipboard.write(m).then(console.log, console.error);
}

// document.addEventListener("copy")