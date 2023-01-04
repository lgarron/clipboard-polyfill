import { stringToBlob } from "./convert";
import {
  ClipboardItemConstructor,
  ClipboardItemDataType,
  ClipboardItemInterface,
  ClipboardItemOptions,
  PresentationStyle,
} from "./spec";

export class ClipboardItemPolyfillImpl implements ClipboardItemInterface {
  public readonly types: string[];
  public readonly presentationStyle: PresentationStyle;
  // We use an underscore to suggest that this field is private. We could
  // theoretically transpile private fields to closure-scoped vars, but
  // TypeScript doesn't do this. So we do the most compatible thing, and only
  // mark it as private.
  private _items: { [type: string]: Blob };
  public constructor(
    // TODO: The spec specifies values as `ClipboardItemData`, but
    // implementations (e.g. Chrome 83) seem to assume `ClipboardItemDataType`
    // values. https://github.com/w3c/clipboard-apis/pull/126
    items: { [type: string]: ClipboardItemDataType },
    options: ClipboardItemOptions = {},
  ) {
    this.types = Object.keys(items);
    this._items = {};
    // We avoid `Object.entries()` to avoid potential compatibility issues.
    for (var type in items) {
      var item = items[type];
      if (typeof item === "string") {
        this._items[type] = stringToBlob(type, item);
      } else {
        this._items[type] = item;
      }
    }
    // The explicit default for `presentationStyle` is "unspecified":
    // https://www.w3.org/TR/clipboard-apis/#clipboard-interface
    this.presentationStyle = options?.presentationStyle ?? "unspecified";
  }

  public getType(type: string): Promise<Blob> {
    return Promise.resolve(this._items[type]);
  }
}

export var ClipboardItemPolyfill: ClipboardItemConstructor =
  ClipboardItemPolyfillImpl;
