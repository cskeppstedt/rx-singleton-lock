# rx-singleton-lock

[![Build Status](https://travis-ci.org/cskeppstedt/rx-singleton-lock.svg?branch=master)](https://travis-ci.org/cskeppstedt/rx-singleton-lock)

## Install

```
npm install rx-singleton-lock --save
yarn add rx-singleton-lock
```

## Usage

```javascript
import { concat, of, pipe } from "rxjs";
import { delay, tap } from "rxjs/operators";
import RxSingletonLock from "rx-singleton-lock";

const dummyRequest$ = str => of(str).pipe(tap(v => console.log(v)));
const dummyLock$ = () => of("locked").pipe(delay(2000));

concat(
  lock.sync(dummyRequest$("request1")),
  lock.sync(dummyRequest$("request2")),
  lock.singleton(dummyLock$()),
  lock.sync(dummyRequest$("request3"))
).subscribe();
```

Notice in the console that `request3` will be delayed until the lock has completed (2 seconds).

## API

### constructor(options)

```javascript
new RxSingletonLock({
  scheduler?: Scheduler;
  traceLog?: (message: string) => any;
  traceErr?: (message: string, e: Error) => any;
})
```

`scheduler` (optional) Specifies the Rx scheduler to use (mostly for unit testing purposes).

`traceLog` (optional) If specified, it will be used in a _trace-tap_ that is attached
inside `sync` and `singleton` to provide debug information.

`traceErr` (optional) If specified, it will be used in a _trace-tap_ that is attached
inside `sync` and `singleton` to provide debug information.

### sync(stream$)

```javascript
sync(stream$: Observable<T>): Observable<T>
```

**If the lock is unlocked:** returns the `stream$` with a _trace-tap_.

**If the lock is locked:** returns a new stream that will wait for the lock to unlock.
Once unlocked it will `switchMap` to the original `stream$` with a _trace-tap_.

### singleton(lock$)

```javascript
singleton(lock$: Observable<T>): Observable<T>
```

**If the lock is unlocked:** returns a `share()` version of `lock$`, with a _trace-tap_.
The lock is now considered **locked** until `lock$` is **completed**.

**If the lock is locked:** returns the shared `lock$` that is currently holding the
lock, with a _trace-tap_. This `lock$` passed as an argument will be discarded and
never subscribed to.

## Description

There is an example React app in `./example` that demonstrates the usage more in practice.

This library was created to solve a specific issue. There was a project where all API
requests were AWS lambda invokes, where the Cognito credentials could expire at any time.
Every single API request went through a central `invoke` function, which used `rxjs/ajax`
internally. If an API call failed due to an expired token, it should start the refresh-token
flow. To avoid starting multiple refresh-flows due to multiple API calls failing simultaneously,
the need for a singleton-lock emerged.

The naming `sync` and `singleton` comes from the idea of making calls _synchronized_ according
to the locking mechanism, and the definition of _singleton_ as "a single person or thing of the
kind under consideration.", since only the first `lock$` stream is considered in the `singleton()`
function while all others are discarded.

## License

[MIT](./LICENSE)
