import { TestScheduler } from "rxjs";
import RxSingletonLock from "../../lib/rx-singleton-lock";
declare const _default: () => {
    lock: RxSingletonLock;
    logs: string[];
    errs: string[];
    scheduler: TestScheduler;
};
export default _default;
