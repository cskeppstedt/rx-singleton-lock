"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var noop = function () { };
function rxSingletonLock(_a) {
    var _b = _a === void 0 ? {} : _a, scheduler = _b.scheduler, traceLog = _b.traceLog, traceErr = _b.traceErr;
    var frame = function (method, seq) {
        return "[" + method + ":" + seq + "]" + (scheduler ? " [t=" + scheduler.now() + "]" : "");
    };
    var log = traceLog
        ? function (seq, method, msg) {
            return traceLog(frame(method, seq) + " " + msg);
        }
        : noop;
    var err = traceErr
        ? function (seq, method, msg, e) {
            return traceErr(frame(method, seq) + " " + msg, e);
        }
        : noop;
    var isLocked = false;
    var syncSubject;
    var seqSync = 0;
    var seqLock = 0;
    return {
        singleton: function (runLockStream) {
            var thisSeqLock = seqLock;
            seqLock++;
            if (isLocked) {
                log(thisSeqLock, "singleton", "(ignored) waiting...");
                return syncSubject.do(function () {
                    return log(thisSeqLock, "singleton", "(ignored) ok.");
                });
            }
            isLocked = true;
            syncSubject = new ReplaySubject_1.ReplaySubject(1, undefined, scheduler);
            log(thisSeqLock, "singleton", "locked.");
            return runLockStream().do(function (value) {
                log(thisSeqLock, "singleton", "ok, unlocked.");
                isLocked = false;
                syncSubject.next(value);
            }, function (e) {
                err(thisSeqLock, "singleton", "stream failed, unlocking.", e);
                isLocked = false;
                syncSubject.next(e);
            });
        },
        sync: function (runStream) {
            var thisSeqSync = seqSync;
            seqSync++;
            var run = function () {
                return runStream().do(function () { return log(thisSeqSync, "sync", "stream ok."); }, function () { return log(thisSeqSync, "sync", "stream failed."); });
            };
            if (!isLocked) {
                log(thisSeqSync, "sync", "ok.");
                return run();
            }
            else {
                log(thisSeqSync, "sync", "waiting...");
                return syncSubject.mergeMap(function () {
                    log(thisSeqSync, "sync", "ok.");
                    return run();
                });
            }
        }
    };
}
exports.default = rxSingletonLock;
