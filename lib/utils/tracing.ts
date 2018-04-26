import { IScheduler } from "rxjs/Scheduler";

export type TraceErr = (message: string, error: Error) => any;
export type TraceLog = (message: string) => any;
export type methodType = "singleton" | "sync";

const noop = () => {};

const frameWithoutScheduler = (seq: number, method: methodType) =>
  `[${method}:${seq}]`;

const frameWithScheduler = (
  seq: number,
  method: methodType,
  scheduler: IScheduler
) => `${frameWithoutScheduler(seq, method)} [t=${scheduler.now()}]`;

const createFormatter = (scheduler?: IScheduler) => {
  const frame = scheduler == null ? frameWithoutScheduler : frameWithScheduler;
  return (seq, method, msg) => `${frame(seq, method, scheduler)} ${msg}`;
};

export const createLog = (traceLog?: TraceLog, scheduler?: IScheduler) => {
  if (traceLog == null) {
    return noop;
  } else {
    const formatter = createFormatter(scheduler);
    return (seq: number, method: methodType, msg: string) =>
      traceLog(formatter(seq, method, msg));
  }
};

export const createErr = (traceErr?: TraceErr, scheduler?: IScheduler) => {
  if (traceErr == null) {
    return noop;
  } else {
    const formatter = createFormatter(scheduler);
    return (seq: number, method: methodType, msg: string, e: Error) =>
      traceErr(formatter(seq, method, msg), e);
  }
};
