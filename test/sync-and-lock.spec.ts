import { expect } from "chai";
import testContext from "./utils/test-context";

describe("rx-singleton-lock", () => {
  it("should support syncing and locking", () => {
    const [
      mSourceA,
      mSourceB,
      mLock,
      mExpectedA,
      mExpectedB,
      mExpectedSingletonA,
      mExpectedSingletonB
    ] = [
      "a|", // sourceA$ emits directly
      "b|", // sourceB$ emits directly
      "--c|", // lock$ emits and completes after a while
      "---1|", // result from syncing sourceA$ emits when lock has completed
      "---2|", // result from syncing sourceB$ emits when lock has completed
      "--x|", // result from singletonA emits when lock$ has completed
      "--y|" // result from singletonB emits when lock$ has completed
    ];

    const { lock, scheduler, errs, logs } = testContext();
    const sourceA$ = scheduler.createColdObservable(mSourceA);
    const sourceB$ = scheduler.createColdObservable(mSourceB);
    const lock$ = scheduler.createHotObservable(mLock);

    scheduler.schedule(() => {
      const resultSingletonA$ = lock.singleton(() => lock$);
      const resultSourceA$ = lock.sync(() => sourceA$);

      scheduler.expectObservable(resultSourceA$).toBe(mExpectedA, { "1": "a" });
      scheduler
        .expectObservable(resultSingletonA$)
        .toBe(mExpectedSingletonA, { x: "c" });
    }, 0);

    scheduler.schedule(() => {
      const resultSourceB$ = lock.sync(() => sourceB$);
      scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });
    }, 15);

    scheduler.schedule(() => {
      const resultSingletonB$ = lock.singleton(() => lock$);
      scheduler
        .expectObservable(resultSingletonB$)
        .toBe(mExpectedSingletonB, { y: "c" });
    }, 18);

    // run tests
    scheduler.flush();
    expect(errs).to.eql([]);
    expect(logs).to.eql([
      "[singleton:0] [t=0] locked.",
      "[sync:0] [t=0] waiting...",
      "[sync:1] [t=15] waiting...",
      "[singleton:1] [t=18] (ignored) waiting...",
      "[singleton:0] [t=30] stream completed, unlocked.",
      "[sync:0] [t=30] ok.",
      "[sync:1] [t=30] ok.",
      "[singleton:1] [t=30] (ignored) stream completed.",
      "[sync:0] [t=30] stream emit.",
      "[sync:1] [t=30] stream emit.",
      "[sync:0] [t=40] stream completed.",
      "[sync:1] [t=40] stream completed."
    ]);
  });
});
