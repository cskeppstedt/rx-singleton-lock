import { assert } from "chai";
import { TestScheduler } from "rxjs/testing";
import RxSingletonLock from "../../lib/rx-singleton-lock";

export default () => {
  const logs: Array<string> = [];
  const errs: Array<string> = [];
  const scheduler = new TestScheduler(assert.deepEqual.bind(assert));
  const lock = new RxSingletonLock({
    scheduler,
    traceErr: (msg: string, e: Error) => errs.push(msg),
    traceLog: (msg: string) => logs.push(msg)
  });
  return { lock, logs, errs, scheduler };
};
