"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clipboard = /** @class */ (function () {
    function clipboard() {
    }
    clipboard.copyListener = function (data, e) {
        data.forEach(function (value, key) {
            console.log(key, value);
            e.clipboardData.setData(key, value);
        });
        e.preventDefault();
    };
    clipboard.execCopy = function (listener) {
        var result = false;
        document.addEventListener("copy", listener);
        try {
            result = document.execCommand("copy");
        }
        finally {
            document.removeEventListener("copy", listener);
        }
        return result;
    };
    clipboard.writePromise = function (data, resolve, reject) {
        var result = this.execCopy(this.copyListener.bind(this, data));
        if (result) {
            resolve();
        }
        else {
            reject(new Error("Copy command failed."));
        }
    };
    clipboard.write = function (data) {
        return new Promise(this.writePromise.bind(this, data));
    };
    clipboard.writeText = function (s) {
        var dt = new clipboard.DT();
        dt.setData("text/plain", s);
        clipboard.write(dt);
    };
    return clipboard;
}());
exports.clipboard = clipboard;
(function (clipboard) {
    var DT = /** @class */ (function () {
        function DT() {
            this.m = new Map();
        }
        DT.prototype.setData = function (type, value) {
            this.m.set(type, value);
        };
        DT.prototype.getData = function (type) {
            return this.m.get(type);
        };
        // TODO: Provide an iterator consistent with DataTransfer.
        DT.prototype.forEach = function (f) {
            return this.m.forEach(f);
        };
        return DT;
    }());
    clipboard.DT = DT;
})(clipboard = exports.clipboard || (exports.clipboard = {}));
exports.clipboard = clipboard;
function test() {
    var m = new clipboard.DT();
    m.setData("text/plain", "hi");
    clipboard.write(m).then(console.log, console.error);
}
//# sourceMappingURL=clipboard.js.map