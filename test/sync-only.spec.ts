import { expect } from "chai";
import testContext from "./utils/test-context";

describe("rx-singleton-lock", () => {
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
});
