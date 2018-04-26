import { expect, assert } from "chai";
import { TestScheduler } from "rxjs";
import rxSingletonLock from "../lib/rx_singleton_lock";

const testContext = () => {
  const logs: Array<string> = [];
  const errs: Array<string> = [];
  const scheduler = new TestScheduler(assert.deepEqual.bind(assert));
  const lock = rxSingletonLock({
    scheduler,
    traceErr: (msg: string) => errs.push(msg),
    traceLog: (msg: string) => logs.push(msg)
  });
  return { lock, logs, errs, scheduler };
};

describe("rxMutex", () => {
  it("should support syncing without locking", () => {
    const [mSourceA, mSourceB, mExpectedA, mExpectedB] = [
      "a|", // sourceA$ emits directly
      "--b|", // sourceB$ emits after a while
      "1|", // result from syncing sourceA$ emits when sourceA$ emits
      "--2|" // result from syncing sourceB$ emits when sourceB$ emits
    ];

    const { lock, scheduler, errs, logs } = testContext();
    const sourceA$ = scheduler.createColdObservable(mSourceA);
    const sourceB$ = scheduler.createColdObservable(mSourceB);

    const resultSourceA$ = lock.sync(() => sourceA$);
    scheduler.expectObservable(resultSourceA$).toBe(mExpectedA, { "1": "a" });

    const resultSourceB$ = lock.sync(() => sourceB$);
    scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });

    // run tests
    scheduler.flush();
    expect(errs).to.eql([]);
    expect(logs).to.eql([
      "[sync:0] [t=0] ok.",
      "[sync:1] [t=0] ok.",
      "[sync:0] [t=0] stream ok.",
      "[sync:1] [t=20] stream ok."
    ]);
  });

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
      "a", // sourceA$ emits directly
      "b", // sourceB$ emits directly
      "--c|", // lock$ emits after a while
      "--1", // result from syncing sourceA$ emits when lock has emitted
      "--2", // result from syncing sourceB$ emits when lock has emitted
      "--x|", // result from singletonA emits when lock$ has emitted
      "--y" // result from singletonB emits when lock$ has emitted
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
      "[singleton:0] [t=20] ok, unlocked.",
      "[sync:0] [t=20] ok.",
      "[sync:1] [t=20] ok.",
      "[singleton:1] [t=20] (ignored) ok.",
      "[sync:0] [t=20] stream ok.",
      "[sync:1] [t=20] stream ok."
    ]);
  });

  it("should unblock syncs when the lock stream throws", () => {
    const [
      mSourceA,
      mSourceB,
      mLock,
      mExpectedA,
      mExpectedB,
      mExpectedSingletonA,
      mExpectedSingletonB
    ] = [
      "a", // sourceA$ emits directly
      "b", // sourceB$ emits directly
      "--#|", // lock$ throws after a while
      "--1", // result from syncing sourceA$ emits when lock has emitted
      "--2", // result from syncing sourceB$ emits when lock has emitted
      "--#", // result from singletonA emits when lock$ has emitted
      "--y" // result from singletonB emits when lock$ has emitted
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
        .toBe(mExpectedSingletonA, { x: "error" });
    }, 0);

    scheduler.schedule(() => {
      const resultSourceB$ = lock.sync(() => sourceB$);
      scheduler.expectObservable(resultSourceB$).toBe(mExpectedB, { "2": "b" });
    }, 15);

    scheduler.schedule(() => {
      const resultSingletonB$ = lock.singleton(() => lock$);
      scheduler
        .expectObservable(resultSingletonB$)
        .toBe(mExpectedSingletonB, { y: "error" });
    }, 18);

    // run tests
    scheduler.flush();
    expect(errs).to.eql(["[singleton:0] [t=20] stream failed, unlocking."]);
    expect(logs).to.eql([
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
