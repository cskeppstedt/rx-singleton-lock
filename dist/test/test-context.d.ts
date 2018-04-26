import { Observable } from "rxjs/Observable";
import { TestScheduler } from "rxjs";
declare const _default: () => {
    lock: {
        singleton<T>(runLockStream: () => Observable<T>): Observable<any>;
        sync<T>(runStream: () => Observable<T>): Observable<T>;
    };
    logs: string[];
    errs: string[];
    scheduler: TestScheduler;
};
export default _default;
