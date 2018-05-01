import { Scheduler } from "rxjs";
export declare type TraceErr = (message: string, error: Error) => any;
export declare type TraceLog = (message: string) => any;
export declare type methodType = "singleton" | "sync";
export declare const noop: () => void;
export declare const createLog: (traceLog?: TraceLog, scheduler?: Scheduler) => (seq: number, method: methodType, msg: string) => any;
export declare const createErr: (traceErr?: TraceErr, scheduler?: Scheduler) => (seq: number, method: methodType, msg: string, e: Error) => any;
