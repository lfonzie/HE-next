'use client'

import { ThemeProvider } from './contexts/ThemeContext'

/**
 * Minimal sandbox used in Storybook-style environments to preview the theme system.
 * This file is not consumed by Next.js directly, but documents how to wire the
 * ThemeProvider and ThemeToggle together in any React tree.
 */
export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-strong)] transition-theme">
        <header className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-12">
        </header>

        <main className="mx-auto grid max-w-4xl gap-6 px-6 pb-16">
          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[var(--color-surface-elevated)] p-8 shadow-elevated">
            <h2 className="text-xl font-semibold">Componentes interativos</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Botões, links e campos de formulário usam o amarelo como cor de foco e ações primárias
              enquanto elementos secundários aproveitam o teal (#03DAC6) para feedback suave.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-accent-contrast)] shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
                Chamada para ação
              </button>
              <button className="rounded-full border border-[color:var(--color-border-strong)] bg-[var(--color-surface-0)] px-5 py-2 text-sm font-semibold text-[var(--color-text-strong)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
                Botão secundário
              </button>
              <a
                href="#detalhes"
                className="rounded-full px-5 py-2 text-sm font-semibold text-[var(--color-accent)] underline-offset-4 transition-colors hover:text-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                Ver detalhes
              </a>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
