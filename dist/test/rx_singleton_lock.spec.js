"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var rxjs_1 = require("rxjs");
var rx_singleton_lock_1 = require("../lib/rx_singleton_lock");
var testContext = function () {
    var logs = [];
    var errs = [];
    var scheduler = new rxjs_1.TestScheduler(chai_1.assert.deepEqual.bind(chai_1.assert));
    var lock = rx_singleton_lock_1.default({
        scheduler: scheduler,
        traceErr: function (msg) { return errs.push(msg); },
        traceLog: function (msg) { return logs.push(msg); }
    });
    return { lock: lock, logs: logs, errs: errs, scheduler: scheduler };
};
describe("rxMutex", function () {
    it("should support syncing without locking", function () {
        var _a = [
            "a|",
            "--b|",
            "1|",
            "--2|" // result from syncing sourceB$ emits when sourceB$ emits
        ], mSourceA = _a[0], mSourceB = _a[1], mExpectedA = _a[2], mExpectedB = _a[3];
        var _b = testContext(), lock = _b.lock, scheduler = _b.scheduler, errs = _b.errs, logs = _b.logs;
        var sourceA$ = scheduler.createColdObservable(mSourceA);
        var sourceB$ = scheduler.createColdObservable(mSourceB);
        var resultSourceA$ = lock.sync(function () { return sourceA$; });
        scheduler.expectObservable(resultSourceA$).toBe(mExpectedA, { "1": "a" });
        var resultSourceB$ = lock.sync(function () { return sourceB$; });
        scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });
        // run tests
        scheduler.flush();
        chai_1.expect(errs).to.eql([]);
        chai_1.expect(logs).to.eql([
            "[sync:0] [t=0] ok.",
            "[sync:1] [t=0] ok.",
            "[sync:0] [t=0] stream ok.",
            "[sync:1] [t=20] stream ok."
        ]);
    });
    it("should support syncing and locking", function () {
        var _a = [
            "a",
            "b",
            "--c|",
            "--1",
            "--2",
            "--x|",
            "--y" // result from singletonB emits when lock$ has emitted
        ], mSourceA = _a[0], mSourceB = _a[1], mLock = _a[2], mExpectedA = _a[3], mExpectedB = _a[4], mExpectedSingletonA = _a[5], mExpectedSingletonB = _a[6];
        var _b = testContext(), lock = _b.lock, scheduler = _b.scheduler, errs = _b.errs, logs = _b.logs;
        var sourceA$ = scheduler.createColdObservable(mSourceA);
        var sourceB$ = scheduler.createColdObservable(mSourceB);
        var lock$ = scheduler.createHotObservable(mLock);
        scheduler.schedule(function () {
            var resultSingletonA$ = lock.singleton(function () { return lock$; });
            var resultSourceA$ = lock.sync(function () { return sourceA$; });
            scheduler.expectObservable(resultSourceA$).toBe(mExpectedA, { "1": "a" });
            scheduler
                .expectObservable(resultSingletonA$)
                .toBe(mExpectedSingletonA, { x: "c" });
        }, 0);
        scheduler.schedule(function () {
            var resultSourceB$ = lock.sync(function () { return sourceB$; });
            scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });
        }, 15);
        scheduler.schedule(function () {
            var resultSingletonB$ = lock.singleton(function () { return lock$; });
            scheduler
                .expectObservable(resultSingletonB$)
                .toBe(mExpectedSingletonB, { y: "c" });
        }, 18);
        // run tests
        scheduler.flush();
        chai_1.expect(errs).to.eql([]);
        chai_1.expect(logs).to.eql([
            "[singleton:0] [t=0] locked.",
            "[sync:0] [t=0] waiting...",
            "[sync:1] [t=15] waiting...",
            "[singleton:1] [t=18] (ignored) waiting...",
            "[singleton:0] [t=20] ok, unlocked.",
            "[sync:0] [t=20] ok.",
            "[sync:1] [t=20] ok.",
            "[singleton:1] [t=20] (ignored) ok.",
            "[sync:0] [t=20] stream ok.",
            "[sync:1] [t=20] stream ok."
        ]);
    });
    it("should unblock syncs when the lock stream throws", function () {
        var _a = [
            "a",
            "b",
            "--#|",
            "--1",
            "--2",
            "--#",
            "--y" // result from singletonB emits when lock$ has emitted
        ], mSourceA = _a[0], mSourceB = _a[1], mLock = _a[2], mExpectedA = _a[3], mExpectedB = _a[4], mExpectedSingletonA = _a[5], mExpectedSingletonB = _a[6];
        var _b = testContext(), lock = _b.lock, scheduler = _b.scheduler, errs = _b.errs, logs = _b.logs;
        var sourceA$ = scheduler.createColdObservable(mSourceA);
        var sourceB$ = scheduler.createColdObservable(mSourceB);
        var lock$ = scheduler.createHotObservable(mLock);
        scheduler.schedule(function () {
            var resultSingletonA$ = lock.singleton(function () { return lock$; });
            var resultSourceA$ = lock.sync(function () { return sourceA$; });
            scheduler.expectObservable(resultSourceA$).toBe(mExpectedA, { "1": "a" });
            scheduler
                .expectObservable(resultSingletonA$)
                .toBe(mExpectedSingletonA, { x: "error" });
        }, 0);
        scheduler.schedule(function () {
            var resultSourceB$ = lock.sync(function () { return sourceB$; });
            scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });
        }, 15);
        scheduler.schedule(function () {
            var resultSingletonB$ = lock.singleton(function () { return lock$; });
            scheduler
                .expectObservable(resultSingletonB$)
                .toBe(mExpectedSingletonB, { y: "error" });
        }, 18);
        // run tests
        scheduler.flush();
        chai_1.expect(errs).to.eql(["[singleton:0] [t=20] stream failed, unlocking."]);
        chai_1.expect(logs).to.eql([
            "[singleton:0] [t=0] locked.",
            "[sync:0] [t=0] waiting...",
            "[sync:1] [t=15] waiting...",
            "[singleton:1] [t=18] (ignored) waiting...",
            "[sync:0] [t=20] ok.",
            "[sync:1] [t=20] ok.",
            "[singleton:1] [t=20] (ignored) ok.",
            "[sync:0] [t=20] stream ok.",
            "[sync:1] [t=20] stream ok."
        ]);
    });
});
