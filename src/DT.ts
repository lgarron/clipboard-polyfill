import { TEXT_PLAIN } from "./data-types";
import {shouldShowWarnings, warn} from "./debug";

const dataTypes = [
  TEXT_PLAIN,
  "text/html",
];

export class DT {
  private m: {[key: string]: string} = {};

  public setData(type: string, value: string): void {
    if (shouldShowWarnings && dataTypes.indexOf(type) === -1) {
      warn("Unknown data type: " + type, "Call clipboard.suppressWarnings() " +
        "to suppress this warning.");
    }

    this.m[type] = value;
  }

  public getData(type: string): string | undefined {
    return this.m[type];
  }

  // TODO: Provide an iterator consistent with DataTransfer.
  public forEach(f: (value: string, key: string) => void): void {
    // tslint:disable-next-line: forin
    for (const k in this.m) {
      f(this.m[k], k);
    }
  }
}

/******** Convenience ********/

export function DTFromText(s: string): DT {
  const dt = new DT();
  dt.setData(TEXT_PLAIN, s);
  return dt;
}
