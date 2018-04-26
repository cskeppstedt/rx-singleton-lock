import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";
export declare type IRunStream<T> = () => Observable<T>;
export interface initOptions {
    scheduler?: IScheduler;
    traceErr?: (message: string, error: Error) => any;
    traceLog?: (message: string) => any;
}
export default function rxSingletonLock({scheduler, traceLog, traceErr}?: initOptions): {
    singleton<T>(runLockStream: IRunStream<T>): Observable<any>;
    sync<T>(runStream: IRunStream<T>): Observable<T>;
};
