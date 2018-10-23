import clipboard from "../../../"

console.log((clipboard && clipboard.write) ? "✅" : "❌");
console.log(clipboard);
