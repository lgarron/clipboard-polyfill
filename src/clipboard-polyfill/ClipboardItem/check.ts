import type { ClipboardItemInterface } from "./spec";

export function hasItemWithType(
  clipboardItems: ClipboardItemInterface[],
  typeName: string,
): boolean {
  for (var i = 0; i < clipboardItems.length; i++) {
    var item = clipboardItems[i];
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
