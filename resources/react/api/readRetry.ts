/** Retry a transient read once. Mutations must never use this helper. */
export async function readWithRetry<T>(read: () => Promise<T>): Promise<T> {
  try { return await read(); }
  catch (error: any) {
    const status = error?.response?.status;
    if (error?.code === 'ERR_CANCELED' || (status && status !== 408 && status !== 429 && status < 500)) throw error;
    const retryAfter = Number(error?.response?.headers?.['retry-after'] ?? 0);
    if (status === 429 && (!Number.isFinite(retryAfter) || retryAfter > 2)) throw error;
    await new Promise(resolve => setTimeout(resolve, Math.max(300, retryAfter * 1000)));
    return read();
  }
}
