export const fetcher = <T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) =>
  fetch(input, init).then((res) => {
    if (!res.ok) {
      throw new Error("network error!");
    }
    if (res.status >= 400 && res.status <= 599) {
      throw new Error("invalid http status code!");
    }
    return res.json() as T;
  });
