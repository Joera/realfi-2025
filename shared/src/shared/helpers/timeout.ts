export const callWithTimeout = async <T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs = 25_000
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Timed out after ${timeoutMs / 1000}s`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};