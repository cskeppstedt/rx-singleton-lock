"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var rxjs_1 = require("rxjs");
var rx_singleton_lock_1 = require("../../lib/rx-singleton-lock");
exports.default = (function () {
    var logs = [];
    var errs = [];
    var scheduler = new rxjs_1.TestScheduler(chai_1.assert.deepEqual.bind(chai_1.assert));
    var lock = new rx_singleton_lock_1.default({
        scheduler: scheduler,
        traceErr: function (msg, e) { return errs.push(msg); },
        traceLog: function (msg) { return logs.push(msg); }
    });
    return { lock: lock, logs: logs, errs: errs, scheduler: scheduler };
});
