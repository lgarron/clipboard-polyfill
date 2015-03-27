# `clipboard.js`

Make copying on the web as easy as:

    clipboard.copy("This text is plain.");

Or:

    clipboard.copy({
      "text/plain": "Markup text. Paste me into a rich text editor.",
      "text/html": "<i>Markup</i> <b>text</b>. Paste me into a rich text editor."
    });

## Usage

Load the script:

    <script src="clipboard.js"></script>

Then copy a `string` or an `object` (mapping [data types](http://www.w3.org/TR/clipboard-apis/#mandatory-data-types-1) to values) as above.
