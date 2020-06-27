![Logo for clipboard-polyfill: an icon of a clipboard fading into a drafting paper grid.](clipboard-polyfill-logo.svg)

# `clipboard-polyfill`

Make copying on the web as easy as:

    clipboard.writeText("hello world");

As of October 2017, this library is a polyfill for the modern `Promise`-based [asynchronous clipboard API](https://www.w3.org/TR/clipboard-apis/#async-clipboard-api).  
(Note: the core library doesn't modify global objects, so it's actually a [_ponyfill_](https://ponyfill.com/).)

## Usage

If you use `npm`, install:

```shell
npm install clipboard-pollyfill
```

Sample app that writes text:

```js
// Using the `clipboard/text` build saves code size.
// This is recommended if you only need to copy text.
import * as clipboard from "clipboard-polyfill/text";

function handler() {
  clipboard.writeText("This text is plain.").then(
    function() { console.log("success!"); },
    function() { console.log("error!"); }
  );
}

window.addEventListener("DOMContentLoaded", function() { const button = document.createElement("button"); button.textContent = "Copy text"; button.addEventListener("click", handler); document.body.appendChild(button); });
```

Notes:

- You need to call a clipboard operation in response to a user gesture (e.g. the event handler for a button click).
  - Some browsers may only allow one clipboard operation per button click.

## Async syntax

```js
import * as clipboard from "clipboard-polyfill/text";

// Async/await syntax.
async function handler() {
  // Read text from the clipboard, if present.
  // Works in: IE 9-11, Chrome 65+, Safari 13.1+
  console.log("Previous clipboard text:", await clipboard.readText());

  await clipboard.writeText("This text is plain.");
}

window.addEventListener("DOMContentLoaded", function() { const button = document.createElement("button"); button.textContent = "Copy text"; button.addEventListener("click", handler); document.body.appendChild(button); });
```

## More MIME types (data types)

```js
import * as clipboard from "clipboard-polyfill";

async function handler() {
  // Read a list of `ClipboardItem`s.
  // Works in: IE 9-11, Chrome 65+, Safari 13.1+
  console.log("Previous clipboard contents:", await clipboard.read());

  // Chrome 83 supports: `text/plain`, `image/png`
  // Sfari 13.1 supports: `text/plain`, `text/html`, `text-uri-list`, `image/png`
  const item = new clipboard.ClipboardItem({
    "text/html": new Blob(["<i>Markup</i> <b>text</b>. Paste me into a rich text editor."], { type: "text/html" }),
    "text/plain": new Blob(["Fallback markup text. Paste me into a rich text editor."], { type: "text/plain" })
  });
  await clipboard.write([item]);
}

window.addEventListener("DOMContentLoaded", function() { const button = document.createElement("button"); button.textContent = "Copy text"; button.addEventListener("click", handler); document.body.appendChild(button); });
```

Check [the Clipboard API specification](https://www.w3.org/TR/clipboard-apis/#clipboard-interface) for more details.

Notes:

- You'll need to use `async` functions for the `await` syntax.
- Currently, `text/plain` and `text/html` are the only data types that can be written to the clipboard across most browsers.
- If you try to copy unsupported data types, they may be silently dropped (e.g. Safari 13.1) or the call may throw an error (e.g. Chrome 83). In general, it is not possible to tell when data types are dropped.
- In some current browsers, `read()` may only return a subset of supported data types, even if the clipboard contains more data types. There is no way to tell if there were more data types.

### `overwrite-globals` version

If you want the library to overwrite the global clipboard API with its implementations, import `clipboard-polyfill/overwrite-globals`. This will turn the library from a ponyfill into a proper polyfill, so you can write code as if the async clipboard API were already implemented in your browser:

```js
import "clipboard-polyfill/overwrite-globals";

async function handler() {
  const item = new window.ClipboardItem({
    "text/html": new Blob(["<i>Markup</i> <b>text</b>. Paste me into a rich text editor."], { type: "text/html" }),
    "text/plain": new Blob(["Fallback markup text. Paste me into a rich text editor."], { type: "text/plain" })
  });

  navigator.clipboard.write([item]);
}

window.addEventListener("DOMContentLoaded", function() { const button = document.createElement("button"); button.textContent = "Copy text"; button.addEventListener("click", handler); document.body.appendChild(button); });
```

This approach is not recommended, because it may break any other code that interacts with the clipboard API globals, and may be incompatible with future browser implementations.

### Flat-file version with `Promise` included

If you need to grab a version that "just works", download [`clipboard-polyfill.promise.js`](https://github.com/lgarron/clipboard-polyfill/releases/latest/download/clipboard-polyfill.promise.js) and include it using a `<script>` tag:

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

## This is way too complicated!

If you only need to copy text, try [this gist](https://gist.github.com/lgarron/d1dee380f4ed9d825ca7) for a simpler solution.

## Compatibility Caveats

Some [compatibility caveats](https://github.com/lgarron/clipboard-polyfill/blob/main/experiment/Conclusions.md) for older browsers:

- In Internet Explorer, you will need to polyfill `window.Promise` if you want the library to work.
- In older versions of Edge (Spartan):
  - It may not be possible to tell if a copy operation succeeded ([Edge Bug #14110451](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14110451/), [Edge Bug #14080262](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14080262/)). `clipboard-polyfill` will always report success in this case.
  - Only the _last_ data type you specify is copied to the clipboard ([Edge Bug #14080506](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14080506/)). Consider placing the most important data type last in the object that you pass to the `ClipoardItem` constructor.
  - The `text/html` data type is not written using the expected `CF_HTML` format. `clipboard-polyfill` does *not* try to work around this, since 1) it would require fragile browser version sniffing, 2) users of Edge are not generally stuck on version < 17, and 3) the failure mode for other browsers would be that invalid clipboard HTML is copied. ([Edge Bug #14372529](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14372529/), [#73](https://github.com/lgarron/clipboard-polyfill/issues/73))

## [Can I use](http://caniuse.com/#feat=clipboard) it?

- Chrome 42+
- Firefox 41+
- Opera 29+
- Internet Explorer 9+ (text only)
- Edge
- Desktop Safari 10+
- iOS Safari 10+ (text only in some versions)

`clipboard-polyfill` uses a variety of heuristics to work around compatibility bugs. Please [let us know](https://github.com/lgarron/clipboard-polyfill/issues/new) if you are running into compatibility issues with any of the browsers listed above.
