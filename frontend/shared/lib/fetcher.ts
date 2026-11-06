/** Ошибка HTTP-запроса к API. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** GET-запрос к API с автоматическим разбором сообщений об ошибках. */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    // Данные всегда актуальные: без кэша браузера и Next.js.
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Запрос завершился с ошибкой (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // тело не JSON — оставляем общее сообщение
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

/** POST-запрос к API с JSON-телом. */
export function postJson<T>(input: string, body: unknown): Promise<T> {
  return fetchJson<T>(input, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
