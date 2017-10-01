# `clipboard.js`

Make copying on the web as easy as:

    clipboard.copy("This text is plain.");

Note: in most browsers, copying is only allowed if `clipboard.copy()` is triggered in direct response to a user gesture like a click or a key press.


### Copy rich text

    clipboard.copy({
      "text/plain": "Markup text. Paste me into a rich text editor.",
      "text/html": "<i>Markup</i> <b>text</b>. Paste me into a rich text editor."
    });


### Copy a DOM node as markup

    clipboard.copy(document.body);

(Uses [XMLSerializer](https://caniuse.com/#search=XMLSerializer).)


### Use the `copy` outcome as a Promise (optional):

    clipboard.copy("test").then(
      function(){console.log("success");},
      function(err){console.log("failure", err);}
    );


### Paste

Pasting plain strings currently works in IE.

    clipboard.paste().then(
      function(result) {console.log(result);},
      function(err) {console.log("failure", err);}
    );


## Usage

Get the source using one of the following:

- `clipboard.js` or `clipboard.min.js`
- `npm install clipboard-js`
- `bower install clipboard.js`

Load the script:

    <script src="clipboard.js"></script>

Then copy a `string` or an `object` (mapping [data types](http://www.w3.org/TR/clipboard-apis/#mandatory-data-types-1) to values) as above.


## What about [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)?

This project is half a year older. :-P  
I created it partially to test the clipboard API while reviewing it for Chrome (I work on Chrome security), and partially to use in [my own project](https://alg.cubing.net/).

I wouldn't have created this project if `zenorocha/clipboard.js` had already existed, but both projects have different uses right now. The fundamental difference is that this project hijacks the copy event, while `zenorocha/clipboard.js` uses fake element selection. Some details (as of November 2015):

This project                                       | `zenorocha/clipboard.js`
---------------------------------------------------|--------------------------
Supports plain strings, `text/html`, and DOM nodes | Only supports plain strings
≈100 lines                                         | ≈700 lines
1.5KB minimized + gzipped                          | 2.9KB minimized + gzipped
Doesn't change document selection †                | Clears document selection
Only an imperative API (`clipboard.copy()`)        | Declarative DOM-based API
Uses `Promise`s                                    | ---
Supports paste (in IE)                             | ---
---                                                | Offers a fallback prompt (`Press Ctrl+C to copy`)

† Copying in Safari doesn't work unless there is a selection. This library [works around that](https://github.com/lgarron/clipboard.js/blob/91f772fdbce2568bb29b376f2bbcb7cf5907dbcd/clipboard.js#L37) by temporarily selecting and deselecting the whole page if nothing was selected to start with. Unfortunately, due to feature detection limits this workaround is also triggered in Chrome when there is no selection.


## This is way too complicated!

Try [this gist](https://gist.github.com/lgarron/d1dee380f4ed9d825ca7) for a simpler solution.


## [Can I use](http://caniuse.com/#feat=clipboard) it?

- Chrome 42+
- Firefox 41+
- Opera 29+
- Internet Explorer 9+ (text only)
- Desktop Safari 10+
- iOS Safari 10+ (text only)

### Limitations

Whever possible, `clipboard.js` attempts to copy the given data without modifying the current selection or the DOM. However, Safari has a [few](https://bugs.webkit.org/show_bug.cgi?id=156529) [bugs](https://bugs.webkit.org/show_bug.cgi?id=177715). Therefore:

- On desktop Safari, `clipboard.js` selects the entire document and synchronously deselects it after the copy event. There is no flicker, but the previous selection is lost.
- On iOS Safari, [a bug](https://bugs.webkit.org/show_bug.cgi?id=177715) prevents `clipboard.js` from setting data for data types using the desktop Safari approach. `clipboard.js` will fall back to copying a plain string, by *temporarily inserting an copyable to the end of `document.body`*.
  - The clipboard will end up empty if the input was a DOM node or an object whose `text/plain` key is not set. It is recommended that you always provide a `text/plain` representation where possible. (If you want to copy a DOM node with a text fallback on iOS, you can use `new XMLSerializer().serializeToString(data)` to get the `text/html` representation of a DOM node yourself, but the `text/plain` representation is up to you.)
