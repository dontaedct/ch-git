export type AppError = { code: string; message: string; cause?: unknown }

export const asAppError = (e: unknown, code = "UNKNOWN"): AppError => {
  if (e instanceof Error) {
    return { code, message: e.message, cause: e }
  }
  if (typeof e === "string") {
    return { code, message: e, cause: e }
  }
  return { code, message: "An unknown error occurred", cause: e }
}
