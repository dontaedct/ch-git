export type Ok<T=unknown> = { ok: true; data?: T };
export type Fail = { ok: false; code: string; message: string };

export const ok = <T=unknown>(data?: T): Ok<T> => ({ ok: true, data });
export const fail = (message: string, code="ERROR"): Fail => ({ ok:false, code, message });

export function toHttpResponse(e: unknown, status=500) {
  const msg = e instanceof Error ? e.message : "Unexpected error";
  return Response.json(fail(msg, status===401 ? "UNAUTHORIZED" : "ERROR"), { status });
}

export function standardizeError(e: unknown): Fail {
  const msg = e instanceof Error ? e.message : "Unexpected error";
  return fail(msg);
}
