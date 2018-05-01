import { Observable, Scheduler } from "rxjs";
import { TraceErr, TraceLog } from "./utils/tracing";
export declare type CreateObservable<T> = () => Observable<T>;
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
    constructor({scheduler, traceLog, traceErr}?: InitOptions);
    singleton<T>(createObservable: CreateObservable<T>): Observable<T>;
    sync<T>(createObservable: CreateObservable<T>): Observable<T>;
}
