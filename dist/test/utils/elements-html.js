"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (elems) {
    var texts = [];
    for (var i = 0; i < elems.length; i++) {
        texts.push(elems[i].innerHTML);
    }
    return texts;
});
