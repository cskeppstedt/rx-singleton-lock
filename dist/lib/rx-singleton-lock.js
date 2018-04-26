"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var tracing_1 = require("./utils/tracing");
var counter_1 = require("./utils/counter");
function rxSingletonLock(_a) {
    var _b = _a === void 0 ? {} : _a, scheduler = _b.scheduler, traceLog = _b.traceLog, traceErr = _b.traceErr;
    var log = tracing_1.createLog(traceLog, scheduler);
    var err = tracing_1.createErr(traceErr, scheduler);
    var counters = { sync: counter_1.default(), singleton: counter_1.default() };
    var isLocked = false;
    var syncSubject;
    return {
        singleton: function (createObservable) {
            var seq = counters.singleton.next();
            if (isLocked) {
                log(seq, "singleton", "(ignored) waiting...");
                return syncSubject.do(function () { return log(seq, "singleton", "(ignored) ok."); });
            }
            log(seq, "singleton", "locked.");
            isLocked = true;
            syncSubject = new ReplaySubject_1.ReplaySubject(1, undefined, scheduler);
            return createObservable().do(function (value) {
                log(seq, "singleton", "ok, unlocked.");
                isLocked = false;
                syncSubject.next(value);
            }, function (e) {
                err(seq, "singleton", "stream failed, unlocking.", e);
                isLocked = false;
                syncSubject.next(e);
            });
        },
        sync: function (createObservable) {
            var seq = counters.sync.next();
            var runStream = function () {
                return createObservable().do(function () { return log(seq, "sync", "stream ok."); }, function () { return log(seq, "sync", "stream failed."); });
            };
            if (!isLocked) {
                log(seq, "sync", "ok.");
                return runStream();
            }
            else {
                log(seq, "sync", "waiting...");
                return syncSubject.mergeMap(function () {
                    log(seq, "sync", "ok.");
                    return runStream();
                });
            }
        }
    };
}
exports.default = rxSingletonLock;
