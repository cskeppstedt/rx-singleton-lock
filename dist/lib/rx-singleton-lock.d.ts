import { Observable, SchedulerLike } from "rxjs";
import { TraceErr, TraceLog } from "./utils/tracing";
export declare type CreateObservable<T> = () => Observable<T>;
export interface InitOptions {
    scheduler?: SchedulerLike;
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
    constructor({ scheduler, traceLog, traceErr }?: InitOptions);
    singleton<T>(lock$: Observable<T>): Observable<T>;
    sync<T>(stream$: Observable<T>): Observable<T>;
}
