var clipboard = {};

clipboard.copy = (function() {
  var interceptCopy = false;
  var copyObject; // Map from data type (e.g. "text/html") to value.

  document.addEventListener("copy", function(e){
    if (interceptCopy) {
      for (key in copyObject) {
        e.clipboardData.setData(key, copyObject[key]);
      }
      e.preventDefault();
    }
  });

  return function(data) {
    interceptCopy = true;
    copyObject = (typeof data === "string" ? {"text/plain": data} : data);
    document.execCommand("copy");
    interceptCopy = false;
  };
}());

clipboard.paste = (function() {
  var interceptPaste = false;
  var _resolve;
  var _dataType;

  document.addEventListener("paste", function(e) {
    if (interceptPaste) {
      interceptPaste = false;
      e.preventDefault();
      _resolve(e.clipboardData.getData(_dataType));
    }
  });

  return function(dataType) {
    return new Promise(function(resolve, reject) {
      interceptPaste = true; // Race condition?
      _resolve = resolve;
      _dataType = dataType || "text/plain";
      document.execCommand("paste");
    });
  };
}());
