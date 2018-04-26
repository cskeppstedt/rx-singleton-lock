"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var rxSingletonLock = function () {
    return {
        singleton: function () {
            return Observable_1.Observable.of("foo");
        }
    };
};
exports.default = rxSingletonLock;
