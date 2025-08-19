export type Ok<T = unknown> = { ok: true; data?: T };
export type Fail = { ok: false; code: string; message: string };

export const ok = <T = unknown>(data?: T): Ok<T> => ({ ok: true, data });
export const fail = (message: string, code = "ERR"): Fail => ({ ok: false, code, message });

// If a caller expects a Response, use this wrapper.
export const asResponse = (f: Fail, status = 400): Response => Response.json(f, { status });
