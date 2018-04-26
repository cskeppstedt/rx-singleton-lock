import { assert } from "chai";
import { Observable } from "rxjs/Observable";
import { TestScheduler } from "rxjs";
import rxSingletonLock from "../lib/rx-singleton-lock";

export default () => {
  const logs: Array<string> = [];
  const errs: Array<string> = [];
  const scheduler = new TestScheduler(assert.deepEqual.bind(assert));
  const lock = rxSingletonLock({
    scheduler,
    traceErr: (msg: string, e: Error) => errs.push(msg),
    traceLog: (msg: string) => logs.push(msg)
  });
  return { lock, logs, errs, scheduler };
};
