import { Observable, ReplaySubject, Scheduler } from "rxjs";
import { share, switchMap, take, tap } from "rxjs/operators";
import counter from "./utils/counter";
import {
  createErr,
  createLog,
  noop,
  TraceErr,
  TraceLog
} from "./utils/tracing";

export type CreateObservable<T> = () => Observable<T>;

export interface InitOptions {
  scheduler?: Scheduler;
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

  public singleton<T>(createObservable: CreateObservable<T>): Observable<T> {
    const seq = this.counters.singleton.next();

    if (this.isLocked) {
      this.log(seq, "singleton", "(ignored) waiting...");
      return this.lockSubject.pipe(
        tap(
          noop,
          e => this.err(seq, "singleton", "(ignored) stream failed.", e),
          () => this.log(seq, "singleton", "(ignored) stream completed.")
        )
      );
    }

    this.log(seq, "singleton", "locked.");
    this.isLocked = true;
    this.syncSubject = new ReplaySubject(1, undefined, this.scheduler);
    this.lockSubject = createObservable().pipe(share());

    return this.lockSubject.pipe(
      tap(
        noop,
        e => {
          this.err(seq, "singleton", "stream failed, unlocking.", e);
          this.isLocked = false;
          this.syncSubject.next(e);
        },
        () => {
          this.log(seq, "singleton", "stream completed, unlocked.");
          this.isLocked = false;
          this.syncSubject.next(null);
        }
      )
    );
  }

  public sync<T>(createObservable: CreateObservable<T>): Observable<T> {
    const seq = this.counters.sync.next();
    const runStream = () =>
      createObservable().pipe(
        tap(
          () => this.log(seq, "sync", "stream emit."),
          () => this.log(seq, "sync", "stream failed."),
          () => this.log(seq, "sync", "stream completed.")
        )
      );

    if (!this.isLocked) {
      this.log(seq, "sync", "ok.");
      return runStream();
    } else {
      this.log(seq, "sync", "waiting...");
      return this.syncSubject.pipe(
        take(1),
        switchMap(() => {
          this.log(seq, "sync", "ok.");
          return runStream();
        })
      );
    }
  }
}
