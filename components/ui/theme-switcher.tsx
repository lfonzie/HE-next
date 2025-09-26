"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Moon, Monitor, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme()

  const activeTheme = theme ?? "system"

  const renderIcon = () => {
    switch (resolvedTheme) {
      case "dark":
        return <Moon className="h-4 w-4" />
      case "light":
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled aria-label="Carregando temas">
        <Sun className="h-4 w-4 animate-pulse" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label="Alterar tema"
        >
          {activeTheme === "system" ? <Monitor className="h-4 w-4" /> : renderIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={activeTheme}
          onValueChange={setTheme}
          aria-label="Seleção de tema"
        >
          <DropdownMenuRadioItem value="light" className="gap-2">
            <Sun className="h-4 w-4" />
            <span>Claro</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2">
            <Moon className="h-4 w-4" />
            <span>Escuro</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span>Automático</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Versão compacta para uso em modais
export function ThemeSwitcherCompact() {
  const { resolvedTheme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" disabled aria-label="Carregando temas">
        <Sun className="h-4 w-4 animate-pulse" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="gap-2 hover:bg-primary/10"
      aria-label={`Alternar para tema ${resolvedTheme === "dark" ? "claro" : "escuro"}`}
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-sm">Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-sm">Escuro</span>
        </>
      )}
    </Button>
  )
}
