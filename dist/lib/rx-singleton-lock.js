"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var tracing_1 = require("./utils/tracing");
require("rxjs/add/operator/do");
require("rxjs/add/operator/share");
require("rxjs/add/operator/switchMap");
require("rxjs/add/operator/take");
var counter_1 = require("./utils/counter");
var RxSingletonLock = /** @class */ (function () {
    function RxSingletonLock(_a) {
        var _b = _a === void 0 ? {} : _a, scheduler = _b.scheduler, traceLog = _b.traceLog, traceErr = _b.traceErr;
        this.log = tracing_1.createLog(traceLog, scheduler);
        this.err = tracing_1.createErr(traceErr, scheduler);
        this.counters = { sync: counter_1.default(), singleton: counter_1.default() };
        this.isLocked = false;
    }
    RxSingletonLock.prototype.singleton = function (createObservable) {
        var _this = this;
        var seq = this.counters.singleton.next();
        if (this.isLocked) {
            this.log(seq, "singleton", "(ignored) waiting...");
            return this.lockSubject.do(function () { }, function (e) { return _this.err(seq, "singleton", "(ignored) stream failed.", e); }, function () { return _this.log(seq, "singleton", "(ignored) stream completed."); });
        }
        this.log(seq, "singleton", "locked.");
        this.isLocked = true;
        this.syncSubject = new ReplaySubject_1.ReplaySubject(1, undefined, this.scheduler);
        this.lockSubject = createObservable().share();
        return this.lockSubject.do(function () { }, function (e) {
            _this.err(seq, "singleton", "stream failed, unlocking.", e);
            _this.isLocked = false;
            _this.syncSubject.next(e);
        }, function (value) {
            _this.log(seq, "singleton", "stream completed, unlocked.");
            _this.isLocked = false;
            _this.syncSubject.next(value);
        });
    };
    RxSingletonLock.prototype.sync = function (createObservable) {
        var _this = this;
        var seq = this.counters.sync.next();
        var runStream = function () {
            return createObservable().do(function () { return _this.log(seq, "sync", "stream emit."); }, function () { return _this.log(seq, "sync", "stream failed."); }, function () { return _this.log(seq, "sync", "stream completed."); });
        };
        if (!this.isLocked) {
            this.log(seq, "sync", "ok.");
            return runStream();
        }
        else {
            this.log(seq, "sync", "waiting...");
            return this.syncSubject.take(1).switchMap(function () {
                _this.log(seq, "sync", "ok.");
                return runStream();
            });
        }
    };
    return RxSingletonLock;
}());
exports.default = RxSingletonLock;
