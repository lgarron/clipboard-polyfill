export * from "../src/targets/overwrite-globals";

// We name this `ClipboardItemInterface` instead of `ClipboardItem` because we
// implement our polyfill from the library as `ClipboardItem`.
export interface ClipboardItemInterface {
  // Safari 13.1 implements `presentationStyle`:
  // https://webkit.org/blog/10855/async-clipboard-api/
  readonly presentationStyle?: PresentationStyle; // [optional here, non-optional in spec]
  readonly lastModified?: number; // [optional here, non-optional in spec]
  readonly delayed?: boolean; // [optional here, non-optional in spec]

  readonly types: string[];

  getType(type: string): Promise<Blob>;
}

export type ClipboardItemDelayedCallback = () => ClipboardItemDelayedCallback;

interface ClipboardItemConstructor {
  // Note: some implementations (e.g. Chrome 83) only acceps Blob item values,
  // and throw an exception if you try to pass any strings.
  new (
    // TODO: The spec specifies values as `ClipboardItemData`, but
    // implementations (e.g. Chrome 83) seem to assume `ClipboardItemDataType`
    // values. https://github.com/w3c/clipboard-apis/pull/126
    items: { [type: string]: ClipboardItemDataType },
    options?: ClipboardItemOptions
  ): ClipboardItemInterface;

  createDelayed?( // [optional here, non-optional in spec]
    items: { [type: string]: () => ClipboardItemDelayedCallback },
    options?: ClipboardItemOptions
  ): ClipboardItemInterface;
}

declare global {
  // @ts-ignore
  const ClipboardItem: ClipboardItemConstructor;
}
