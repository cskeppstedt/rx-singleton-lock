import sample from "./lib/sample";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";

const rxSingletonLock = () => {
  return {
    singleton() {
      return Observable.of("foo");
    }
  };
};

export default rxSingletonLock;
