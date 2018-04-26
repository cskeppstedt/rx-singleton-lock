import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
declare const rxSingletonLock: () => {
    singleton(): Observable<string>;
};
export default rxSingletonLock;
