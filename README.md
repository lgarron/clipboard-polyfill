# `clipboard.js`

Make copying on the web as easy as:

    clipboard.copy("This text is plain.");

Or:

    clipboard.copy({
      "text/plain": "Markup text. Paste me into a rich text editor.",
      "text/html": "<i>Markup</i> <b>text</b>. Paste me into a rich text editor."
    });

You can optionally use the result as a Promise:

    clipboard.copy("test").then(
      function(){console.log("success");},
      function(err){console.log("failure", err);
    });

Note: Copying will fail if `clipboard.copy()` is not triggered in direct response to a user gesture.

## Paste

Pasting currently works in IE.

    clipboard.paste().then(function(result) {
      console.log(result);
    }, function(err) {
      console.log("failure", err);
    });

Pasting is actually synchronous, but the API uses a Promise to guard against future implementations. (In particular, Chrome will probably try to issue an async permission request.)

## Usage

Load the script:

    <script src="clipboard.js"></script>

Then copy a `string` or an `object` (mapping [data types](http://www.w3.org/TR/clipboard-apis/#mandatory-data-types-1) to values) as above.

## What about [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)?

This project is half a year older. :-P
I created it partially to test the clipboard API while reviewing it for Chrome (I work on Chrome security), and partially to use in [my own project](https://alg.cubing.net/).

I wouldn't have created this project if `zenorocha/clipboard.js` had already existed, but both projects have different uses right now. The fundamental difference is that this project hijacks the copy event, while `zenorocha/clipboard.js` uses fake element selection. Some details (as of November 2015):

This project                                | `zenorocha/clipboard.js`
--------------------------------------------|--------------------------
Supports plain strings and `text/html`      | Only supports plain strings
≈100 lines                                  | ≈700 lines
1.5KB minimized + gzipped                   | 2.9KB minimized + gzipped
Doesn't change document selection           | Clears document selection
Only an imperative API (`clipboard.copy()`) | Declarative DOM-based API
Uses `Promise`s                             | -
Supports paste (in IE)                      | -
-                                           | Tries to offer a fallback prompt (`Press Ctrl+C to copy`)

## [Can I use](http://caniuse.com/#feat=clipboard) it?

- Chrome 42+
- Firefox 41+
- Opera 29+
- Internet Explorer 9+
