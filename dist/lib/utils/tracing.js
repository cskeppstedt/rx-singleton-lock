"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = function () {
    // do nothing
};
var frameWithoutScheduler = function (seq, method) {
    return "[" + method + ":" + seq + "]";
};
var frameWithScheduler = function (seq, method, scheduler) { return frameWithoutScheduler(seq, method) + " [t=" + scheduler.now() + "]"; };
var createFormatter = function (scheduler) {
    var frame = scheduler == null ? frameWithoutScheduler : frameWithScheduler;
    return function (seq, method, msg) { return frame(seq, method, scheduler) + " " + msg; };
};
exports.createLog = function (traceLog, scheduler) {
    if (traceLog == null) {
        return exports.noop;
    }
    else {
        var formatter_1 = createFormatter(scheduler);
        return function (seq, method, msg) {
            return traceLog(formatter_1(seq, method, msg));
        };
    }
};
exports.createErr = function (traceErr, scheduler) {
    if (traceErr == null) {
        return exports.noop;
    }
    else {
        var formatter_2 = createFormatter(scheduler);
        return function (seq, method, msg, e) {
            return traceErr(formatter_2(seq, method, msg), e);
        };
    }
};
