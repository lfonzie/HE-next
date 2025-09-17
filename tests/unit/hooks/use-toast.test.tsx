import { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/hooks/use-toast'

describe('useToast', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('throws when used outside of ToastProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider'
    )
    consoleErrorSpy.mockRestore()
  })

  it('adds and dismisses toasts manually', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    )

    const { result } = renderHook(() => useToast(), { wrapper })

    let toastId = ''
    act(() => {
      const { id } = result.current.toast({ title: 'Hello world', duration: 0 })
      toastId = id
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]?.title).toBe('Hello world')

    act(() => {
      result.current.dismiss(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('automatically clears toasts after their duration', () => {
    jest.useFakeTimers()

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    )

    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.toast({ title: 'Auto dismiss', duration: 1000 })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(result.current.toasts).toHaveLength(0)
  })
})
