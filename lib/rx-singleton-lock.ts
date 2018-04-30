import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { TraceErr, TraceLog, createLog, createErr } from "./utils/tracing";
import "rxjs/add/operator/do";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/take";
import counter from "./utils/counter";

export type CreateObservable<T> = () => Observable<T>;

export interface InitOptions {
  scheduler?: IScheduler;
  traceErr?: TraceErr;
  traceLog?: TraceLog;
}

export default class RxSingletonLock {
  private err;
  private log;
  private counters;
  private scheduler;
  private isLocked;
  private syncSubject;

  constructor({ scheduler, traceLog, traceErr }: InitOptions = {}) {
    this.log = createLog(traceLog, scheduler);
    this.err = createErr(traceErr, scheduler);
    this.counters = { sync: counter(), singleton: counter() };
    this.isLocked = false;
  }
  singleton<T>(createObservable: CreateObservable<T>): Observable<T> {
    const seq = this.counters.singleton.next();

    if (this.isLocked) {
      this.log(seq, "singleton", "(ignored) waiting...");
      return this.syncSubject.do(() =>
        this.log(seq, "singleton", "(ignored) ok.")
      );
    }

    this.log(seq, "singleton", "locked.");
    this.isLocked = true;
    this.syncSubject = new ReplaySubject(1, undefined, this.scheduler);

    return createObservable().do(
      value => {
        this.log(seq, "singleton", "ok, unlocked.");
        this.isLocked = false;
        this.syncSubject.next(value);
      },
      e => {
        this.err(seq, "singleton", "stream failed, unlocking.", e);
        this.isLocked = false;
        this.syncSubject.next(e);
      }
    );
  }

  sync<T>(createObservable: CreateObservable<T>): Observable<T> {
    const seq = this.counters.sync.next();
    const runStream = () => {
      const obs = createObservable();

      return obs.do(
        () => this.log(seq, "sync", "stream ok."),
        () => this.log(seq, "sync", "stream failed.")
      );
    };

    if (!this.isLocked) {
      this.log(seq, "sync", "ok.");
      return runStream();
    } else {
      this.log(seq, "sync", "waiting...");
      return this.syncSubject.mergeMap(() => {
        this.log(seq, "sync", "ok.");
        return runStream();
      });
    }
  }
}
