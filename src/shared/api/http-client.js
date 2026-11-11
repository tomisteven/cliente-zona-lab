const DEFAULT_API_BASE_URL = '/api';
const CSRF_COOKIE = 'zl_admin_csrf';
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details } = {}) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function resolveConfiguredUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '';
  }

  return rawUrl.trim().replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  return resolveConfiguredUrl(import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_BASE_URL;
}

export function getApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
}

export function resolveMediaUrl(src) {
  if (typeof src !== 'string' || !src.trim()) {
    return '';
  }

  const value = src.trim();

  if (ABSOLUTE_URL_PATTERN.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  if (!value.startsWith('/uploads/')) {
    return value;
  }

  const mediaBaseUrl = resolveConfiguredUrl(import.meta.env.VITE_MEDIA_BASE_URL);

  if (mediaBaseUrl) {
    return `${mediaBaseUrl}${value}`;
  }

  const apiBaseUrl = resolveApiBaseUrl();

  if (ABSOLUTE_URL_PATTERN.test(apiBaseUrl)) {
    return `${new URL(apiBaseUrl).origin}${value}`;
  }

  return value;
}

function buildUrl(path) {
  return getApiUrl(path);
}

export function getCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }

  for (const part of document.cookie.split(';')) {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    if (part.slice(0, separatorIndex).trim() !== name) {
      continue;
    }

    try {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

function notifyUnauthorized(path) {
  if (
    path.startsWith('/admin/') &&
    !path.startsWith('/admin/auth/login') &&
    typeof globalThis.dispatchEvent === 'function'
  ) {
    globalThis.dispatchEvent(new Event('admin:unauthorized'));
  }
}

export async function request(path, { signal, headers, body, ...options } = {}) {
  let response;
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  let requestBody = body;

  if (
    body !== undefined &&
    body !== null &&
    typeof body === 'object' &&
    !(body instanceof FormData)
  ) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      body: requestBody,
      headers: requestHeaders,
      signal,
      credentials: 'include',
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    throw new ApiError('No se pudo conectar con el servidor.');
  }

  let responseBody = null;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      throw new ApiError('El servidor devolvió una respuesta inválida.', {
        status: response.status,
        code: 'INVALID_RESPONSE',
      });
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized(path);
    }

    const errorBody = responseBody?.error;

    throw new ApiError(errorBody?.message ?? 'La solicitud no pudo completarse.', {
      status: response.status,
      code: errorBody?.code ?? 'REQUEST_FAILED',
      details: errorBody?.details,
    });
  }

  return responseBody;
}

export function adminRequest(path, options = {}) {
  const csrfToken = getCookie(CSRF_COOKIE);

  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
  });
}
