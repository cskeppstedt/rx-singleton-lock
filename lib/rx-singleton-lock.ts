import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { TraceErr, TraceLog, createLog, createErr } from "./utils/tracing";
import "rxjs/add/operator/do";
import "rxjs/add/operator/share";
import "rxjs/add/operator/switchMap";
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
  private lockSubject;

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
      return this.lockSubject.do(
        () => {},
        e => this.err(seq, "singleton", "(ignored) stream failed.", e),
        () => this.log(seq, "singleton", "(ignored) stream completed.")
      );
    }

    this.log(seq, "singleton", "locked.");
    this.isLocked = true;
    this.syncSubject = new ReplaySubject(1, undefined, this.scheduler);
    this.lockSubject = createObservable().share();

    return this.lockSubject.do(
      () => {},
      e => {
        this.err(seq, "singleton", "stream failed, unlocking.", e);
        this.isLocked = false;
        this.syncSubject.next(e);
      },
      value => {
        this.log(seq, "singleton", "stream completed, unlocked.");
        this.isLocked = false;
        this.syncSubject.next(value);
      }
    );
  }

  sync<T>(createObservable: CreateObservable<T>): Observable<T> {
    const seq = this.counters.sync.next();
    const runStream = () =>
      createObservable().do(
        () => this.log(seq, "sync", "stream emit."),
        () => this.log(seq, "sync", "stream failed."),
        () => this.log(seq, "sync", "stream completed.")
      );

    if (!this.isLocked) {
      this.log(seq, "sync", "ok.");
      return runStream();
    } else {
      this.log(seq, "sync", "waiting...");
      return this.syncSubject.take(1).switchMap(() => {
        this.log(seq, "sync", "ok.");
        return runStream();
      });
    }
  }
}
