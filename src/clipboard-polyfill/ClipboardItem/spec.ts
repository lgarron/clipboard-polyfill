// This should be a `.d.ts` file, but we need to make it `.ts` (or Rollup won't include it in the output).

// This file is a representation of the Clipboard Interface from the async
// clipboard API spec. We match the order and spacing of the spec as much as
// possible, for easy comparison.
// https://www.w3.org/TR/clipboard-apis/#clipboard-interface

// The spec specifies some non-optional fields, but initial browser implementations of the async clipboard API
// may not have them. We don't rely on their existence in this library, and we
// mark them as optional with [optional here, non-optional in spec].

export type ClipboardItems = ClipboardItemInterface[];

export interface Clipboard extends EventTarget {
  read(): Promise<ClipboardItems>;
  readText(): Promise<string>;
  write(data: ClipboardItems): Promise<void>;
  writeText(data: string): Promise<void>;
}

export type ClipboardItemDataType = string | Blob;
export type ClipboardItemData = Promise<ClipboardItemDataType>;

export type ClipboardItemDelayedCallback = () => ClipboardItemDelayedCallback;

// We can't specify the constructor (or static methods) inside the main
// interface definition, so we specify it separately. See
// https://www.typescriptlang.org/docs/handbook/interfaces.html#difference-between-the-static-and-instance-sides-of-classes
export interface ClipboardItemConstructor {
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

export type PresentationStyle = "unspecified" | "inline" | "attachment";

export interface ClipboardItemOptions {
  presentationStyle?: PresentationStyle;
}
