"use strict";

export class clipboard {
  private static copyListener(data: clipboard.DT, e: ClipboardEvent) {
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
    return new Promise(this.writePromise.bind(this, data));
  }

  static writeText(s: string): void {
    var dt = new clipboard.DT();
    dt.setData("text/plain", s);
    clipboard.write(dt);
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
}

function test() {
  var m = new clipboard.DT();
  m.setData("text/plain", "hi");
  clipboard.write(m).then(console.log, console.error);
}

// document.addEventListener("copy")