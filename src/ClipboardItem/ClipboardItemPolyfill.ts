import {
  ClipboardItemInterface,
  ClipboardItemDataMap,
  ClipboardItemConstructor,
  ClipboardItemOptions,
  PresentationStyle,
} from "./ClipboardItemInterface";

export class ClipboardItemPolyfillImpl implements ClipboardItemInterface {
  public readonly types: string[];
  public readonly presentationStyle: PresentationStyle;
  public constructor(
    private items: ClipboardItemDataMap,
    options: ClipboardItemOptions = {}
  ) {
    this.types = Object.keys(items);
    // The explicit default for `presentationStyle` is "unspecified":
    // https://www.w3.org/TR/clipboard-apis/#clipboard-interface
    this.presentationStyle = options?.presentationStyle ?? "unspecified";
  }

  public async getType(type: string): Promise<Blob> {
    return this.items[type];
  }

  // public readonly lastModified: number;
  // public readonly delayed: boolean;
  // public createDelayed(items: {[type: string]: ClipboardItemData}, options?: ClipboardItemOptions) {}
}

export const ClipboardItemPolyfill: ClipboardItemConstructor = ClipboardItemPolyfillImpl;

export function hasItemWithType(
  clipboardItems: ClipboardItemInterface[],
  typeName: string
): boolean {
  for (const item of clipboardItems) {
    if (item.types.indexOf(typeName) !== -1) {
      return true;
    }
  }
  return false;
}
