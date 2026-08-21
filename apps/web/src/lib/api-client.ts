/**
 * Type-safe API Client for SimpleStore Backend
 */

import { HealthCheckResponse } from "@simplestore/shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

type TokenOrOptions = string | RequestOptions | undefined;

function normalizeOptions(opts?: TokenOrOptions): RequestOptions {
  if (!opts) return {};
  if (typeof opts === "string") {
    return { token: opts };
  }
  return opts;
}

function extractErrorMessage(errorData: any, statusText: string, status: number): string {
  if (!errorData) return `Request failed with status ${status} (${statusText})`;
  if (typeof errorData === "string") return errorData;
  if (typeof errorData.detail === "string") return errorData.detail;
  if (Array.isArray(errorData.detail)) {
    return errorData.detail
      .map((e: any) => (typeof e === "string" ? e : e.msg || e.message || JSON.stringify(e)))
      .join(", ");
  }
  if (errorData.message && typeof errorData.message === "string") return errorData.message;
  return `Request failed with status ${status}`;
}

async function request<T>(
  endpoint: string,
  options?: TokenOrOptions
): Promise<T> {
  const normalized = normalizeOptions(options);
  const { token, params, headers, ...customConfig } = normalized;

  // Prefix with /api/v1 if not starting with /api/v1 or root /
  let path = endpoint;
  if (!path.startsWith("/api/v1") && !path.startsWith("http")) {
    path = `/api/v1${path.startsWith("/") ? "" : "/"}${path}`;
  }

  let url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const reqHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      const errorMessage = extractErrorMessage(errorData, response.statusText, response.status);
      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      (error as Error).message || "Network connection error"
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: TokenOrOptions) =>
    request<T>(endpoint, { ...normalizeOptions(options), method: "GET" }),
  post: <T>(endpoint: string, body?: any, options?: TokenOrOptions) =>
    request<T>(endpoint, {
      ...normalizeOptions(options),
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: TokenOrOptions) =>
    request<T>(endpoint, {
      ...normalizeOptions(options),
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: TokenOrOptions) =>
    request<T>(endpoint, { ...normalizeOptions(options), method: "DELETE" }),

  // Specific domain helpers
  health: {
    check: () => request<HealthCheckResponse>("/api/v1/health"),
    root: () => request<{ app: string; status: string; docs: string }>("/"),
  },
};
