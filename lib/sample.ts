import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";

export default (n: number) => Observable.of(n);
