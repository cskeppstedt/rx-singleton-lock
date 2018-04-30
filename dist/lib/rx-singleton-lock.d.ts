import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { TraceErr, TraceLog } from "./utils/tracing";
import "rxjs/add/operator/do";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/take";
export declare type CreateObservable<T> = () => Observable<T>;
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
    constructor({scheduler, traceLog, traceErr}?: InitOptions);
    singleton<T>(createObservable: CreateObservable<T>): Observable<T>;
    sync<T>(createObservable: CreateObservable<T>): Observable<T>;
}
