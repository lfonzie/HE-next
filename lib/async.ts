export async function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  })

  try {
    return await Promise.race([task, timeoutPromise])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}
