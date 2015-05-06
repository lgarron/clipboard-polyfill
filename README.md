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

## [Can I use](http://caniuse.com/#feat=clipboard) it?

As of March 26, 2015:

- Chrome Canary
- Internet Explorer (doesn't work with `clipboard.js` yet)
