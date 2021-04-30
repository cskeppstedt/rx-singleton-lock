import * as React from "react";
import * as ReactDOM from "react-dom";
import { forkJoin, of } from "rxjs";
import { delay } from "rxjs/operators";
import RxSingletonLock from "../lib/rx-singleton-lock";

interface IExampleState {
  lock: RxSingletonLock;
  log: string[];
  lockDuration: number | "";
}

let valueCounter = 0;
const defaultLockDuration = 3000;

class Example extends React.Component<{}, IExampleState> {
  constructor(props) {
    super(props);
    this.state = {
      lock: new RxSingletonLock({
        traceErr: this.appendLog.bind(this),
        traceLog: this.appendLog.bind(this),
      }),
      lockDuration: "",
      log: [],
    };
  }

  public appendLog(msg) {
    this.setState((s) => ({ log: [...s.log, msg] }));
  }

  public handleSync() {
    const value = valueCounter++;
    this.state.lock.sync(of(value)).subscribe(
      (n) => console.log(`(sync) ${value}, got value: ${n}`),
      (e) => console.error(`(sync) ${value}, got err: ${e}`),
      () => console.log(`(sync) ${value}, completed`)
    );
  }

  public handleForkJoinSync() {
    const value = valueCounter++;
    forkJoin(
      this.state.lock.sync(of(20).pipe(delay(600))),
      this.state.lock.sync(of(10).pipe(delay(100)))
    ).subscribe(
      (n) => console.log(`(forkJoin-sync) ${value}, got value: ${n}`),
      (e) => console.error(`(forkJoin-sync) ${value}, got err: ${e}`),
      () => console.log(`(forkJoin-sync) ${value}, completed`)
    );
  }

  public handleLock() {
    const value = valueCounter++;
    this.state.lock
      .singleton(
        of(value).pipe(
          delay(
            this.state.lockDuration === ""
              ? defaultLockDuration
              : this.state.lockDuration
          )
        )
      )
      .subscribe(
        (n) => console.log(`(lock) ${value}, got value: ${n}`),
        (e) => console.error(`(lock) ${value}, got err: ${e}`),
        () => console.log(`(lock) ${value}, completed`)
      );
  }

  public handleReset() {
    console.clear();
    valueCounter = 0;
    this.setState({
      lock: new RxSingletonLock({
        traceErr: this.appendLog.bind(this),
        traceLog: this.appendLog.bind(this),
      }),
      log: [],
    });
  }

  public handleSetLockDuration(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value.trim();
    const lockDuration = text === "" ? text : parseInt(text, 10) || 0;
    this.setState((s) => ({ ...s, lockDuration }));
  }

  public render() {
    return (
      <div>
        <button data-id="sync" onClick={this.handleSync.bind(this)}>
          Sync
        </button>
        <button
          data-id="sync-forkjoin"
          onClick={this.handleForkJoinSync.bind(this)}
        >
          Sync (forkJoin)
        </button>
        <button data-id="lock" onClick={this.handleLock.bind(this)}>
          Lock
        </button>
        <button data-id="data-reset" onClick={this.handleReset.bind(this)}>
          Reset
        </button>
        <input
          data-id="lock-duration"
          placeholder={`Lock duration (default ${defaultLockDuration}ms)`}
          onChange={this.handleSetLockDuration.bind(this)}
          value={this.state.lockDuration}
          size={30}
        />
        <ul data-id="message-list" style={{ fontFamily: "monospace" }}>
          {this.state.log.map((msg, i) => (
            <li data-id={`message-item-${i}`} key={i}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<Example />, document.getElementById("app"));
