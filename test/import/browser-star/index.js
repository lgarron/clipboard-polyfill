import * as clipboard from "./clipboard-polyfill.js";

console.log((clipboard && clipboard.write) ? "✅" : "❌");
console.log(clipboard);
