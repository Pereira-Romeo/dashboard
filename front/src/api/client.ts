export const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  return err instanceof ApiError ? err.message : fallback;
}

type ErrorMap = Record<number, string>;

const DEFAULT_ERRORS: ErrorMap = {
  401: "Session expired, please log in again",
  403: "Access denied",
  429: "Too many requests, please try again in a moment",
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: FormData | Record<string, unknown>;
  auth?: boolean;
  errors?: ErrorMap;
  fallback?: string;
};

export async function request<T>(
  path: string,
  {
    method = "GET",
    body,
    auth = true,
    errors = {},
    fallback = "Something went wrong",
  }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = localStorage.getItem("token");
    if (!token) throw new ApiError(DEFAULT_ERRORS[401], 401);
    headers.Authorization = `Bearer ${token}`;
  }

  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: isForm ? body : body && JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server, please check your connection",
      0
    );
  }

  if (!response.ok) {
    const message =
      errors[response.status] ?? DEFAULT_ERRORS[response.status] ?? fallback;
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Invalid server response", response.status);
  }
}
