"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_context_1 = require("./utils/test-context");
describe("rx-singleton-lock", function () {
    it("should support syncing without locking", function () {
        var _a = [
            "a|",
            "--b|",
            "1|",
            "--2|" // result from syncing sourceB$ emits when sourceB$ emits
        ], mSourceA = _a[0], mSourceB = _a[1], mExpectedA = _a[2], mExpectedB = _a[3];
        var _b = test_context_1.default(), lock = _b.lock, scheduler = _b.scheduler, errs = _b.errs, logs = _b.logs;
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
            "[sync:0] [t=0] stream emit.",
            "[sync:0] [t=10] stream completed.",
            "[sync:1] [t=20] stream emit.",
            "[sync:1] [t=30] stream completed."
        ]);
    });
});
