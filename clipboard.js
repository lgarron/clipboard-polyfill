var clipboard = {};

clipboard.copy = (function() {
  var interceptCopy = false;
  var copyData;

  document.addEventListener("copy", function(e){
    if (interceptCopy) {
      if (typeof copyData === "string") {
        e.clipboardData.setData("text/plain", copyData);
      }
      else{
        for (key in copyData) {
          e.clipboardData.setData(key, copyData[key]);
        }
      }
      e.preventDefault();
    }
  });

  return function(data) {
    console.log("Copying:", data);
    interceptCopy = true;
    copyData = data;
    document.execCommand("copy");
    interceptCopy = false;
  };
}());

