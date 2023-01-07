import * as clipboard from "../../clipboard-polyfill/entries/es6/clipboard-polyfill.es6";

function handler() {
  clipboard.writeText("This text is plain.").then(
    () => {
      console.log("success!");
    },
    () => {
      console.log("error!");
    },
  );
}

window.addEventListener("DOMContentLoaded", function () {
  var button = document.body.appendChild(document.createElement("button"));
  button.textContent = "Copy";
  button.addEventListener("click", handler);
});
