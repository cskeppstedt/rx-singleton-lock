"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var testing_1 = require("rxjs/testing");
var rx_singleton_lock_1 = require("../../lib/rx-singleton-lock");
exports.default = (function () {
    var logs = [];
    var errs = [];
    var scheduler = new testing_1.TestScheduler(chai_1.assert.deepEqual.bind(chai_1.assert));
    var lock = new rx_singleton_lock_1.default({
        scheduler: scheduler,
        traceErr: function (msg, e) { return errs.push(msg); },
        traceLog: function (msg) { return logs.push(msg); }
    });
    return { lock: lock, logs: logs, errs: errs, scheduler: scheduler };
});
