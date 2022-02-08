![Logo for clipboard-polyfill: an icon of a clipboard fading into a drafting paper grid.](clipboard-polyfill-logo.svg)

# `clipboard-polyfill`

## ⚠️⚠️⚠️ TO BE DEPRECATED ⚠️⚠️⚠️

I plan to deprecate `clipboard-polyfill` in the near future, since it has finished serving its purpose of providing a simple, safe clipboard API in lieu of browser support.

If you believe you have a use case that warrants continued maintenance, please [file an issue](https://github.com/lgarron/clipboard-polyfill/issues/new)!

### A brief history

This project dates from a time when clipboard access in JS was barely becoming possible, and [ergonomic clipboard API efforts were stalling](https://lists.w3.org/Archives/Public/public-webapps/2015JulSep/0235.html). (See [this presentation](https://docs.google.com/presentation/d/1Ix2rYi67hbZoIQsd85kspkUPLi8Q-PZopy_AtfafHW0/) for a bit more context.) Fortunately, [an ergonomic API with the same functionality](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard) is now available in all modern browsers since 2020:

- 2015: Browsers [start supporting](https://caniuse.com/mdn-api_document_execcommand_copy) the [defunct](https://w3c.github.io/editing/docs/execCommand/) `document.execCommand("copy")` call (with [many, many issues](./experiment/Conclusions.md)).
- 2015: Started this project as `clipboard.js` (half a year before @zenorocha picked [the same name](https://github.com/zenorocha/clipboard.js) 😛).
- 2016: Renewed discussions about an async clipboard API (e.g. [proposal doc](https://docs.google.com/document/d/1QI5rKJSiYeD9ekP2NyCYJuOnivduC9-tqEOn-GsCGS4/edit#), [`crbug.com/593475`](https://bugs.chromium.org/p/chromium/issues/detail?id=593475)).
- 2017: Renamed this project to `clipboard-polyfill` to reflect a `v2` API overhaul aligned with the draft spec.
- 2018: Browsers [start supporting](https://caniuse.com/mdn-api_clipboard_writetext) `navigator.clipboard.writeText()`.
- 2020: Browsers [start supporting](https://caniuse.com/mdn-api_clipboard_write) `navigator.clipboard.write()` (including `text/html` support).

Thanks to Gary Kacmarcik, Hallvord Steen, and others for helping to bring the [async clipboard API](https://w3c.github.io/clipboard-apis/) to life!

---

## Summary

Makes copying on the web as easy as:

    clipboard.writeText("hello world");

This library is a [ponyfill](https://github.com/sindresorhus/ponyfill)/polyfill for the modern `Promise`-based [asynchronous clipboard API](https://www.w3.org/TR/clipboard-apis/#async-clipboard-api).

Note: As of 2021, you can use `navigator.clipboard` [in the stable versions of all major browsers](https://caniuse.com/mdn-api_clipboard_writetext). This library will only be useful to you if you need to target older browsers (see below for compatibility).

## Usage

If you use `npm`, install:

```shell
npm install clipboard-polyfill
```

Sample app that copies text to the clipboard:

```js
// Using the `clipboard/text` build saves code size.
// This is recommended if you only need to copy text.
import * as clipboard from "clipboard-polyfill/text";

function handler() {
  clipboard.writeText("This text is plain.").then(
    () => {
      console.log("success!");
    },
    () => {
      console.log("error!");
    }
  );
}

window.addEventListener("DOMContentLoaded", function () {
  const button = document.body.appendChild(document.createElement("button"));
  button.textContent = "Copy";
  button.addEventListener("click", handler);
});
```

Notes:

- You need to call a clipboard operation in response to a user gesture (e.g. the event handler for a `button` click).
  - Some browsers may only allow one clipboard operation per gesture.

## `async`/`await` syntax

```js
import * as clipboard from "clipboard-polyfill/text";

async function handler() {
  console.log("Previous clipboard text:", await clipboard.readText());

  await clipboard.writeText("This text is plain.");
}

window.addEventListener("DOMContentLoaded", function () {
  const button = document.body.appendChild(document.createElement("button"));
  button.textContent = "Copy";
  button.addEventListener("click", handler);
});
```

## More MIME types (data types)

```js
import * as clipboard from "clipboard-polyfill";

async function handler() {
  console.log("Previous clipboard contents:", await clipboard.read());

  const item = new clipboard.ClipboardItem({
    "text/html": new Blob(
      ["<i>Markup</i> <b>text</b>. Paste me into a rich text editor."],
      { type: "text/html" }
    ),
    "text/plain": new Blob(
      ["Fallback markup text. Paste me into a rich text editor."],
      { type: "text/plain" }
    ),
  });
  await clipboard.write([item]);
}

window.addEventListener("DOMContentLoaded", function () {
  const button = document.body.appendChild(document.createElement("button"));
  button.textContent = "Copy";
  button.addEventListener("click", handler);
});
```

Check [the Clipboard API specification](https://www.w3.org/TR/clipboard-apis/#clipboard-interface) for more details.

Notes:

- You'll need to use `async` functions for the `await` syntax.
- Currently, `text/plain` and `text/html` are the only data types that can be written to the clipboard across most browsers.
- If you try to copy unsupported data types, they may be silently dropped (e.g. Safari 13.1) or the call may throw an error (e.g. Chrome 83). In general, it is not possible to tell when data types are dropped.
- In some current browsers, `read()` may only return a subset of supported data types, even if the clipboard contains more data types. There is no way to tell if there were more data types.

### `overwrite-globals` version

If you want the library to overwrite the global clipboard API with its implementations, import `clipboard-polyfill/overwrite-globals`. This will turn the library from a [ponyfill](https://ponyfill.com/) into a proper polyfill, so you can write code as if the async clipboard API were already implemented in your browser:

```js
import "clipboard-polyfill/overwrite-globals";

async function handler() {
  const item = new window.ClipboardItem({
    "text/html": new Blob(
      ["<i>Markup</i> <b>text</b>. Paste me into a rich text editor."],
      { type: "text/html" }
    ),
    "text/plain": new Blob(
      ["Fallback markup text. Paste me into a rich text editor."],
      { type: "text/plain" }
    ),
  });

  navigator.clipboard.write([item]);
}

window.addEventListener("DOMContentLoaded", function () {
  const button = document.body.appendChild(document.createElement("button"));
  button.textContent = "Copy";
  button.addEventListener("click", handler);
});
```

This approach is not recommended, because it may break any other code that interacts with the clipboard API globals, and may be incompatible with future browser implementations.

### Flat-file version with `Promise` included

If you need to grab a version that "just works", download [`clipboard-polyfill.promise.js`](https://unpkg.com/browse/clipboard-polyfill/dist/promise/clipboard-polyfill.promise.js) and include it using a `<script>` tag:

```html
<script src="./clipboard-polyfill.promise.js"></script>
<button onclick="copy()">Copy text!</button>
<script>
  // `clipboard` is defined on the global `window` object.
  function copy() {
    clipboard.writeText("hello world!");
  }
</script>
```

## Why `clipboard-polyfill`?

Browsers have implemented several clipboard APIs over time, and writing to the clipboard without [triggering bugs in various old and current browsers](https://github.com/lgarron/clipboard-polyfill/blob/master/experiment/Conclusions.md) is fairly tricky. In every browser that supports copying to the clipboard in some way, `clipboard-polyfill` attempts to act as close as possible to the async clipboard API. (See above for disclaimers and limitations.)

See [this presentation](https://docs.google.com/presentation/d/1Ix2rYi67hbZoIQsd85kspkUPLi8Q-PZopy_AtfafHW0) for for a longer history of clipboard access on the web.

## Compatibility

- ☑️: Browser has native async clipboard support.
- ✅: `clipboard-polyfill` adds support.
- ❌: Support is not possible.
- **Bold browser names** indicate the latest functionality changes for stable versions of modern browsers.

Write support by earliest browser version:

| Browser                                     | `writeText()` | `write()` (HTML) | `write()` (other formats)          |
| ------------------------------------------- | ------------- | ---------------- | ---------------------------------- |
| **Safari 13.1**                             | ☑️            | ☑️               | ☑️ (`image/uri-list`, `image/png`) |
| **Chrome 86**ᵃ / **Edge 86**                | ☑️            | ☑️               | ☑️ (`image/png`)                   |
| Chrome 76ᵃ / Edge 79                        | ☑️            | ✅               | ☑️ (`image/png`)                   |
| Chrome 66ᵃ / **Firefox 63**                 | ☑️            | ✅               | ❌                                 |
| Safari 10 / Chrome 42ᵃ / Edgeᵈ / Firefox 41 | ✅            | ✅ᵇ              | ❌                                 |
| IE 9                                        | ✅ᶜ           | ❌               | ❌                                 |

Read support:

| Browser                                                                             | `readText()` | `read()` (HTML) | `read()` (other formats)           |
| ----------------------------------------------------------------------------------- | ------------ | --------------- | ---------------------------------- |
| **Safari 13.1**                                                                     | ☑️           | ☑️              | ☑️ (`image/uri-list`, `image/png`) |
| **Chrome [76](https://web.dev/image-support-for-async-clipboard/)** ᵃ / **Edge 79** | ☑️           | ❌              | ☑️ (`image/png`)                   |
| Chrome [66](https://developers.google.com/web/updates/2018/03/clipboardapi)ᵃ        | ☑️           | ❌              | ❌                                 |
| IE 9                                                                                | ✅ᶜ          | ❌              | ❌                                 |
| **Firefox**                                                                         | ❌           | ❌              | ❌                                 |

- ᵃ Also includes versions of Edge, Opera, Brave, Vivaldi, etc. based on the corresponding version of Chrome.
- ᵇ HTML did not work properly on mobile Safari in the first few releases of version 10.
- ᶜ In Internet Explorer, you will need to polyfill `window.Promise` if you want the library to work.
- ᵈ In older versions of Edge (Spartan):
  - It may not be possible to tell if a copy operation succeeded ([Edge Bug #14110451](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14110451/), [Edge Bug #14080262](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14080262/)). `clipboard-polyfill` will always report success in this case.
  - Only the _last_ data type you specify is copied to the clipboard ([Edge Bug #14080506](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14080506/)). Consider placing the most important data type last in the object that you pass to the `ClipboardItem` constructor.
  - The `text/html` data type is not written using the expected `CF_HTML` format. `clipboard-polyfill` does _not_ try to work around this, since 1) it would require fragile browser version sniffing, 2) users of Edge are not generally stuck on version < 17, and 3) the failure mode for other browsers would be that invalid clipboard HTML is copied. ([Edge Bug #14372529](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14372529/), [#73](https://github.com/lgarron/clipboard-polyfill/issues/73))

`clipboard-polyfill` uses a variety of heuristics to work around compatibility bugs. Please [let us know](https://github.com/lgarron/clipboard-polyfill/issues/new) if you are running into compatibility issues with any of the browsers listed above.

## This is way too complicated!

If you only need to copy text in modern browsers, consider using `navigator.clipboard.writeText()` directly: <https://caniuse.com/mdn-api_clipboard_writetext>

If you need copy text in older browsers as well, you could also try [this gist](https://gist.github.com/lgarron/d1dee380f4ed9d825ca7) for a simple hacky solution.
