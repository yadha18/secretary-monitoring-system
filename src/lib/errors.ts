import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.fields = fields;
  }
}

type MongoDuplicateError = { code: number; keyPattern?: Record<string, unknown> };

function isDuplicateKeyError(err: unknown): err is MongoDuplicateError {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

/** Konversi error apa pun menjadi respons JSON seragam: { error: { code, message, fields? } } */
export function handleApiError(err: unknown): Response {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "data";
    appError = new AppError("CONFLICT", "Data dengan nilai tersebut sudah ada.", {
      [field]: "Nilai sudah digunakan.",
    });
  } else if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) fields[issue.path.join(".") || "_"] ??= issue.message;
    appError = new AppError("VALIDATION_ERROR", "Data tidak valid.", fields);
  } else if (err instanceof Error && err.name === "ValidationError" && "errors" in err) {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries((err as unknown as { errors: Record<string, { message: string }> }).errors)) {
      fields[k] = v.message;
    }
    appError = new AppError("VALIDATION_ERROR", "Data tidak valid.", fields);
  } else {
    console.error("[API ERROR]", err);
    appError = new AppError("INTERNAL_ERROR", "Terjadi kesalahan pada server.");
  }

  return Response.json(
    { error: { code: appError.code, message: appError.message, fields: appError.fields } },
    { status: appError.status }
  );
}
