# `clipboard.js`

This library has been superseded by [`clipboard-polyfill`](https://github.com/lgarron/clipboard-polyfill), which works in more browsers.

Here's how to migrate:

# Plain Text

```
// clipboard.js
clipboard.copy("plain text");
```

```
// clipboard-polyfill
clipboard.writeText("plain text");
```

# Rich Text

```
// clipboard.js
clipboard.copy({
  "text/plain": "Fallback markup text.",
  "text/html": "<i>Markup</i> <b>text</b>."
});
```

```
// clipboard-polyfill, similar to async clipboard API
var dt = new clipboard.DT();
dt.setData("text/plain", "Fallback markup text.");
dt.setData("text/html", "<i>Markup</i> <b>text</b>.");
clipboard.write(dt);
```

# DOM element

```
// clipboard.js
clipboard.copy(document.body);
```

```
// clipboard-polyfill, similar to async clipboard API
var dt = new clipboard.DT();
dt.setData("text/plain", document.body.innerText);
dt.setData("text/html", new XMLSerializer().serializeToString(document.body));
clipboard.write(dt);
```

