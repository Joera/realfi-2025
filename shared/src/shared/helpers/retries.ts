export const withRetry = async <T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: {
    retries?: number;
    timeoutMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const { retries = 3, timeoutMs = 25_000, onRetry } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fn(controller.signal);
    } catch (error: any) {
      lastError = error.name === 'AbortError'
        ? new Error(`Timed out after ${timeoutMs / 1000}s`)
        : error;

      onRetry?.(attempt, lastError!);

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 1000));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error('Failed after retries');
};