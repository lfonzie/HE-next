"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme as useNextTheme } from "next-themes"

const STORAGE_KEY = "hubedu-theme"

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const activeTheme = resolvedTheme ?? systemTheme ?? "light"

    root.dataset.theme = activeTheme
    root.style.setProperty("color-scheme", activeTheme === "dark" ? "dark" : "light")

    document.body.classList.toggle("theme-dark", activeTheme === "dark")
    document.body.classList.toggle("theme-light", activeTheme !== "dark")
  }, [mounted, resolvedTheme, systemTheme])

  const toggleTheme = useMemo(() => {
    return () => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
      setTheme(nextTheme)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, nextTheme)
      }
    }
  }, [resolvedTheme, setTheme])

  const setAndPersistTheme = useMemo(() => {
    return (value: string) => {
      setTheme(value)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, value)
      }
    }
  }, [setTheme])

  return {
    theme,
    setTheme: setAndPersistTheme,
    resolvedTheme,
    systemTheme,
    mounted,
    toggleTheme,
  }
}
