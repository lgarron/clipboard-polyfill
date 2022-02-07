export function hasItemWithType(
  clipboardItems: ClipboardItems,
  typeName: string
): boolean {
  for (const item of clipboardItems) {
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
