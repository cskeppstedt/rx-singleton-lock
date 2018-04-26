"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () {
    var counter = 0;
    return { next: function () { return counter++; } };
});
