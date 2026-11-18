export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;
  constructor(message: string, status: number, code?: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/** fetch JSON dengan penanganan error seragam. Sesi berakhir → arahkan ke login. */
export async function apiFetch<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    // Reload penuh disengaja agar state klien bersih saat sesi berakhir.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/login");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error;
    throw new ApiError(e?.message ?? "Terjadi kesalahan.", res.status, e?.code, e?.fields);
  }
  return body as T;
}
