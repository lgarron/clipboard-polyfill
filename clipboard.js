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
