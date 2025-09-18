import { withTimeout } from '@/lib/async'

describe('withTimeout', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves when the task finishes before the timeout', async () => {
    jest.useFakeTimers()

    const task = new Promise<string>(resolve => {
      setTimeout(() => resolve('done'), 50)
    })

    const resultPromise = withTimeout(task, 100, 'Should not time out')

    jest.advanceTimersByTime(50)

    await expect(resultPromise).resolves.toBe('done')
  })

  it('rejects when the task exceeds the timeout', async () => {
    jest.useFakeTimers()

    const never = new Promise<never>(() => {})

    const resultPromise = withTimeout(never, 75, 'Too slow')

    jest.advanceTimersByTime(75)

    await expect(resultPromise).rejects.toThrow('Too slow')
  })
})
