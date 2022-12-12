import { ClipboardItemInterface } from "./spec";

export function hasItemWithType(
  clipboardItems: ClipboardItemInterface[],
  typeName: string,
): boolean {
  for (var item of clipboardItems) {
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
