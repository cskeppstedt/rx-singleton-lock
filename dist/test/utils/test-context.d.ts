import { Observable } from "rxjs/Observable";
import { TestScheduler } from "rxjs";
declare const _default: () => {
    lock: {
        singleton<T>(createObservable: () => Observable<T>): Observable<any>;
        sync<T>(createObservable: () => Observable<T>): Observable<T>;
    };
    logs: string[];
    errs: string[];
    scheduler: TestScheduler;
};
export default _default;
