var clipboard = {};

clipboard.copy = (function() {
  var _intercept = false;
  var _data; // Map from data type (e.g. "text/html") to value.

  document.addEventListener("copy", function(e){
    if (_intercept) {
      for (var key in _data) {
        e.clipboardData.setData(key, _data[key]);
      }
      e.preventDefault();
    }
    _intercept = false;
  });

  return function(data) {
    return new Promise(function(resolve, reject) {
      _intercept = true; // Race condition?
      _data = (typeof data === "string" ? {"text/plain": data} : data);
      try {
        if (document.execCommand("copy")) {
          // document.execCommand is synchronous: http://www.w3.org/TR/2015/WD-clipboard-apis-20150421/#integration-with-rich-text-editing-apis
          // So we can call resolve() back here.
          resolve();
        }
        else {
          _intercept = false;
          reject(new Error("Unable to copy. Perhaps it's not available in your browser?"));
        }
      }
      catch (e) {
        _intercept = false;
        reject(e);
      }
    });
  };
}());

clipboard.paste = (function() {
  var _intercept = false;
  var _resolve;
  var _dataType;

  document.addEventListener("paste", function(e) {
    if (_intercept) {
      _intercept = false;
      e.preventDefault();
      _resolve(e.clipboardData.getData(_dataType));
    }
  });

  return function(dataType) {
    return new Promise(function(resolve, reject) {
      _intercept = true; // Race condition?
      _resolve = resolve;
      _dataType = dataType || "text/plain";
      try {
        if (!document.execCommand("paste")) {
          _intercept = false;
          reject(new Error("Unable to paste. Perhaps it's not available in your browser?"));
        }
      } catch (e) {
        _intercept = false;
        reject(new Error(e));
      }
    });
  };
}());
