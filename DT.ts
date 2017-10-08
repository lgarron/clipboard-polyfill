import {DataTypes, DataTypeLookup} from "./DataTypes"

export default class DT {
  private m: Map<string, string> = new Map<string, string>();

  setData(type: string, value: string): void {
    if (!(type in DataTypeLookup)) {
      (console.warn || console.log).call(console, "[clipboard.js] Unknown data type: " + type);
    }

    this.m.set(type, value);
  }

  getData(type: string): string | undefined {
    return this.m.get(type);
  }

  // TODO: Provide an iterator consistent with DataTransfer.
  forEach(f: (value: string, key: string) => void): void {
    return this.m.forEach(f);
  }

  static fromText(s: string): DT {
    var dt = new DT();
    dt.setData(DataTypes.TEXT_PLAIN, s);
    return dt;
  }

  static fromObject(obj: {[key:string]:string}): DT {
    var dt = new DT();
    for (var key in obj) {
      dt.setData(key, obj[key]);
    }
    return dt;
  }

  static fromElement(e: HTMLElement): DT {
    var dt = new DT();
    dt.setData(DataTypes.TEXT_PLAIN, e.innerText);
    dt.setData(DataTypes.TEXT_HTML, new XMLSerializer().serializeToString(e));
    return dt;
  }
}
