import { Logger } from "../logger";

export type JobResult = {
  ok: true;
  job: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  meta?: Record<string, any>;
} | {
  ok: false;
  job: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  code: string;
  message: string;
  meta?: Record<string, any>;
};

export async function runJob(
  job: string,
  fn: () => Promise<{ meta?: Record<string, any> }>,
  opts?: { timeoutMs?: number }
): Promise<JobResult> {
  const started = Date.now();
  const op = Logger.operation(`job:${job}`);
  op.debug("Starting job");

  const run = async () => {
    const { meta } = await fn();
    return meta;
  };

  try {
    const meta = await (opts?.timeoutMs ? withTimeout(run(), opts.timeoutMs) : run());
    const finished = Date.now();
    op.log("Job completed", { durationMs: finished - started, meta });
    return {
      ok: true,
      job,
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      meta,
    };
  } catch (e: any) {
    const finished = Date.now();
    const code = e?.code || "JOB_FAILED";
    const message = e?.message || String(e);
    op.error("Job failed", { durationMs: finished - started, code, message });
    return {
      ok: false,
      job,
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      code,
      message,
    };
  }
}

async function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  let to: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    to = setTimeout(() => {
      const err: any = new Error("job timeout");
      err.code = "JOB_TIMEOUT";
      reject(err);
    }, timeoutMs);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    // @ts-ignore
    clearTimeout(to);
  }
}

