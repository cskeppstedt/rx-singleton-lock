import * as React from "react";
import * as ReactDOM from "react-dom";
import RxSingletonLock from "../lib/rx-singleton-lock";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/do";
import "rxjs/add/operator/delay";
import "rxjs/add/observable/forkJoin";
import "rxjs/add/observable/of";

interface ExampleProps {}
interface ExampleState {
  log: Array<string>;
  lock: RxSingletonLock;
}

let valueCounter = 0;

class Example extends React.Component<ExampleProps, ExampleState> {
  constructor(props) {
    super(props);
    this.state = {
      log: [],
      lock: new RxSingletonLock({
        traceErr: this.appendLog.bind(this),
        traceLog: this.appendLog.bind(this)
      })
    };
  }

  appendLog(msg) {
    this.setState(s => ({ log: [...s.log, msg] }));
  }

  handleSync() {
    const value = valueCounter++;
    this.state.lock
      .sync(() => Observable.of(value))
      .subscribe(
        n => console.log(`(sync) ${value}, got value: ${n}`),
        e => console.error(`(sync) ${value}, got err: ${e}`),
        () => console.log(`(sync) ${value}, completed`)
      );
  }

  handleForkJoinSync() {
    const value = valueCounter++;
    Observable.forkJoin(
      this.state.lock.sync(() => Observable.of(20).delay(600)),
      this.state.lock.sync(() => Observable.of(10).delay(100))
    ).subscribe(
      n => console.log(`(forkJoin-sync) ${value}, got value: ${n}`),
      e => console.error(`(forkJoin-sync) ${value}, got err: ${e}`),
      () => console.log(`(forkJoin-sync) ${value}, completed`)
    );
  }

  handleLock() {
    const value = valueCounter++;
    this.state.lock
      .singleton(() => Observable.of(value).delay(3000))
      .subscribe(
        n => console.log(`(lock) ${value}, got value: ${n}`),
        e => console.error(`(lock) ${value}, got err: ${e}`),
        () => console.log(`(lock) ${value}, completed`)
      );
  }

  handleReset() {
    console.clear();
    valueCounter = 0;
    this.setState({
      log: [],
      lock: new RxSingletonLock({
        traceErr: this.appendLog.bind(this),
        traceLog: this.appendLog.bind(this)
      })
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.handleSync.bind(this)}>Sync</button>
        <button onClick={this.handleForkJoinSync.bind(this)}>
          Sync (forkJoin)
        </button>
        <button onClick={this.handleLock.bind(this)}>Lock</button>
        <button onClick={this.handleReset.bind(this)}>Reset</button>
        <ul style={{ fontFamily: "monospace" }}>
          {this.state.log.map((msg, i) => <li key={i}>{msg}</li>)}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<Example />, document.getElementById("app"));