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
  });

  return function(data) {
    _intercept = true;
    _data = (typeof data === "string" ? {"text/plain": data} : data);
    document.execCommand("copy");
    _intercept = false;
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
      document.execCommand("paste");
    });
  };
}());
