import { ClipboardItemInterface } from "./spec";

export function hasItemWithType(
  clipboardItems: ClipboardItemInterface[],
  typeName: string,
): boolean {
  for (var i in clipboardItems) {
    var item = clipboardItems[i];
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
