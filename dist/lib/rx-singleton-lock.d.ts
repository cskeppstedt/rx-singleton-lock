import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
import { TraceErr, TraceLog } from "./utils/tracing";
export declare type CreateObservable<T> = () => Observable<T>;
export interface InitOptions {
    scheduler?: IScheduler;
    traceErr?: TraceErr;
    traceLog?: TraceLog;
}
export default function rxSingletonLock({scheduler, traceLog, traceErr}?: InitOptions): {
    singleton<T>(createObservable: CreateObservable<T>): Observable<any>;
    sync<T>(createObservable: CreateObservable<T>): Observable<T>;
};
