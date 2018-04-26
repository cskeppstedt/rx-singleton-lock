import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { TraceErr, TraceLog, createLog, createErr } from "./utils/tracing";
import counter from "./utils/counter";

export type CreateObservable<T> = () => Observable<T>;
export interface InitOptions {
  scheduler?: IScheduler;
  traceErr?: TraceErr;
  traceLog?: TraceLog;
}

export default function rxSingletonLock({
  scheduler,
  traceLog,
  traceErr
}: InitOptions = {}) {
  const log = createLog(traceLog, scheduler);
  const err = createErr(traceErr, scheduler);
  const counters = { sync: counter(), singleton: counter() };

  let isLocked = false;
  let syncSubject: ReplaySubject<any>;

  return {
    singleton<T>(createObservable: CreateObservable<T>) {
      const seq = counters.singleton.next();

      if (isLocked) {
        log(seq, "singleton", "(ignored) waiting...");
        return syncSubject.do(() => log(seq, "singleton", "(ignored) ok."));
      }

      log(seq, "singleton", "locked.");
      isLocked = true;
      syncSubject = new ReplaySubject(1, undefined, scheduler);

      return createObservable().do(
        value => {
          log(seq, "singleton", "ok, unlocked.");
          isLocked = false;
          syncSubject.next(value);
        },
        e => {
          err(seq, "singleton", "stream failed, unlocking.", e);
          isLocked = false;
          syncSubject.next(e);
        }
      );
    },

    sync<T>(createObservable: CreateObservable<T>) {
      const seq = counters.sync.next();
      const runStream = () =>
        createObservable().do(
          () => log(seq, "sync", "stream ok."),
          () => log(seq, "sync", "stream failed.")
        );

      if (!isLocked) {
        log(seq, "sync", "ok.");
        return runStream();
      } else {
        log(seq, "sync", "waiting...");
        return syncSubject.mergeMap(() => {
          log(seq, "sync", "ok.");
          return runStream();
        });
      }
    }
  };
}
