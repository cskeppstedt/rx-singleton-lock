import { Scheduler } from "rxjs";

export type TraceErr = (message: string, error: Error) => any;
export type TraceLog = (message: string) => any;
export type methodType = "singleton" | "sync";

export const noop = () => {
  // do nothing
};

const frameWithoutScheduler = (seq: number, method: methodType) =>
  `[${method}:${seq}]`;

const frameWithScheduler = (
  seq: number,
  method: methodType,
  scheduler: Scheduler
) => `${frameWithoutScheduler(seq, method)} [t=${scheduler.now()}]`;

const createFormatter = (scheduler?: Scheduler) => {
  const frame = scheduler == null ? frameWithoutScheduler : frameWithScheduler;
  return (seq, method, msg) => `${frame(seq, method, scheduler)} ${msg}`;
};

export const createLog = (traceLog?: TraceLog, scheduler?: Scheduler) => {
  if (traceLog == null) {
    return noop;
  } else {
    const formatter = createFormatter(scheduler);
    return (seq: number, method: methodType, msg: string) =>
      traceLog(formatter(seq, method, msg));
  }
};

export const createErr = (traceErr?: TraceErr, scheduler?: Scheduler) => {
  if (traceErr == null) {
    return noop;
  } else {
    const formatter = createFormatter(scheduler);
    return (seq: number, method: methodType, msg: string, e: Error) =>
      traceErr(formatter(seq, method, msg), e);
  }
};
