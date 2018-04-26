import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";

type methodType = "singleton" | "sync";
export type IRunStream<T> = () => Observable<T>;
export interface initOptions {
  scheduler?: IScheduler;
  traceErr?: (message: string, error: Error) => any;
  traceLog?: (message: string) => any;
}

const noop = () => {};

export default function rxSingletonLock({
  scheduler,
  traceLog,
  traceErr
}: initOptions = {}) {
  const frame = (method: methodType, seq: number) =>
    `[${method}:${seq}]${scheduler ? ` [t=${scheduler.now()}]` : ""}`;

  const log = traceLog
    ? (seq: number, method: methodType, msg: string) =>
        traceLog(`${frame(method, seq)} ${msg}`)
    : noop;

  const err = traceErr
    ? (seq: number, method: methodType, msg: string, e: Error) =>
        traceErr(`${frame(method, seq)} ${msg}`, e)
    : noop;

  let isLocked = false;
  let syncSubject: ReplaySubject<any>;

  let seqSync = 0;
  let seqLock = 0;

  return {
    singleton<T>(runLockStream: IRunStream<T>) {
      const thisSeqLock = seqLock;
      seqLock++;

      if (isLocked) {
        log(thisSeqLock, "singleton", "(ignored) waiting...");
        return syncSubject.do(() =>
          log(thisSeqLock, "singleton", "(ignored) ok.")
        );
      }

      isLocked = true;
      syncSubject = new ReplaySubject(1, undefined, scheduler);

      log(thisSeqLock, "singleton", "locked.");

      return runLockStream().do(
        value => {
          log(thisSeqLock, "singleton", "ok, unlocked.");
          isLocked = false;
          syncSubject.next(value);
        },
        e => {
          err(thisSeqLock, "singleton", "stream failed, unlocking.", e);
          isLocked = false;
          syncSubject.next(e);
        }
      );
    },

    sync<T>(runStream: IRunStream<T>) {
      const thisSeqSync = seqSync;
      seqSync++;

      const run = () =>
        runStream().do(
          () => log(thisSeqSync, "sync", "stream ok."),
          () => log(thisSeqSync, "sync", "stream failed.")
        );

      if (!isLocked) {
        log(thisSeqSync, "sync", "ok.");
        return run();
      } else {
        log(thisSeqSync, "sync", "waiting...");
        return syncSubject.mergeMap(() => {
          log(thisSeqSync, "sync", "ok.");
          return run();
        });
      }
    }
  };
}
