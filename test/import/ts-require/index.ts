import clipboard = require("../../../")

console.log((clipboard && clipboard.write) ? "✅" : "❌");
console.log(clipboard);
