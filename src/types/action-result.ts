export type FieldErrors = Record<string, string[]>;
export type SafeFormValues = Record<string, string>;

export type ActionResult<T> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "validation_error"; message: string; fieldErrors: FieldErrors; values?: SafeFormValues }
  | { status: "unauthorized"; message: string; values?: SafeFormValues }
  | { status: "not_found"; message: string }
  | { status: "conflict"; message: string }
  | { status: "internal_error"; message: string; errorId: string; values?: SafeFormValues };
