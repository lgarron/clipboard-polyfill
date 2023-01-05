import { promiseConstructor } from "../builtin-globals";
import { stringToBlob } from "./convert";
import {
  ClipboardItemConstructor,
  ClipboardItemDataType,
  ClipboardItemInterface,
  ClipboardItemOptions,
} from "./spec";

function ClipboardItemPolyfillImpl(
  // TODO: The spec specifies values as `ClipboardItemData`, but
  // implementations (e.g. Chrome 83) seem to assume `ClipboardItemDataType`
  // values. https://github.com/w3c/clipboard-apis/pull/126
  items: { [type: string]: ClipboardItemDataType },
  options?: ClipboardItemOptions,
): ClipboardItemInterface {
  var types = Object.keys(items);
  var _items: { [type: string]: Blob } = {};
  for (var type in items) {
    var item = items[type];
    if (typeof item === "string") {
      _items[type] = stringToBlob(type, item);
    } else {
      _items[type] = item;
    }
  }
  // The explicit default for `presentationStyle` is "unspecified":
  // https://www.w3.org/TR/clipboard-apis/#clipboard-interface
  var presentationStyle = options?.presentationStyle ?? "unspecified";

  function getType(type: string): Promise<Blob> {
    return promiseConstructor.resolve(_items[type]);
  }
  return {
    types: types,
    presentationStyle: presentationStyle,
    getType: getType,
  };
}

export var ClipboardItemPolyfill: ClipboardItemConstructor =
  ClipboardItemPolyfillImpl as any as ClipboardItemConstructor;
