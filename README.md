# `clipboard.js`

Make copying on the web as easy as:

    clipboard.writeText("This text is plain.");

Note: in most browsers, copying is only allowed if `clipboard.copy()` is triggered in direct response to a user gesture like a click or a key press.

As of 2017, this library is intended as a polyfill for the modern `Promise`-based [asynchronous clipboard API](https://www.w3.org/TR/clipboard-apis/#async-clipboard-api).

### Copy rich text

Copying data other than plain text uses a `DataTransfer` shim called `clipboard.DT`.
(See below for why this is necessary.)

    var dt = new clipboard.DT();
    dt.setData("text/plain", "Fallback markup text. Paste me into a rich text editor.");
    dt.setData("text/html", "<i>Markup</i> <b>text</b>. Paste me into a rich text editor.");

    clipboard.write(dt);

### Paste

Pasting plain strings currently works in Internet Explorer and Chrome extensions:

    clipboard.read().then(
      console.log,
      console.error
    );


## Usage

Get the source using one of the following:

- [`build/clipboard.js`](./build/clipboard.js)
- `npm install clipboard-polyfill`

## This is way too complicated!

Try [this gist](https://gist.github.com/lgarron/d1dee380f4ed9d825ca7) for a simpler solution.


## [Can I use](http://caniuse.com/#feat=clipboard) it?

- Chrome 42+
- Firefox 41+
- Opera 29+
- Internet Explorer 9+ (text only)
- Desktop Safari 10+
- iOS Safari 10+ (text only)

## Limitations

- In Microsoft Edge, it is impossible to detect if the copy action actually succeeded. This polyfill will always call `resolve()` in Edge.
- On iOS Safari, only text copying works.

TODO