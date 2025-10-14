import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export function ModernDarkModeDemo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            Dark Mode com Amarelo Forte
          </h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-300 hover-lift"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Cards Modernos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-6 rounded-xl border border-border hover-lift">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{i}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Card {i}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Este é um exemplo de card moderno com efeitos glassmorphism e gradientes sutis.
                </p>
                <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
                  Ação
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Forms Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Formulários Modernos</h2>
          <div className="bg-card p-6 rounded-xl border border-border max-w-2xl">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  placeholder="Digite seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  placeholder="Digite seu email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 resize-none"
                  placeholder="Digite sua mensagem"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-6 py-3 rounded-lg font-medium hover-lift"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Botões Modernos</h2>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary px-6 py-3 rounded-lg font-medium hover-lift">
                Primário
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover-lift">
                Secundário
              </button>
              <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-medium hover-lift">
                Destrutivo
              </button>
              <button className="bg-success text-success-foreground px-6 py-3 rounded-lg font-medium hover-lift">
                Sucesso
              </button>
              <button className="bg-info text-info-foreground px-6 py-3 rounded-lg font-medium hover-lift">
                Info
              </button>
              <button className="bg-warning text-warning-foreground px-6 py-3 rounded-lg font-medium hover-lift">
                Aviso
              </button>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Tipografia Moderna</h2>
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
            <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
            <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
            <h4 className="text-xl font-medium text-foreground">Heading 4</h4>
            <p className="text-foreground leading-relaxed">
              Este é um parágrafo de exemplo com tipografia moderna e legibilidade otimizada.
              O texto é claro e fácil de ler tanto no modo claro quanto no escuro.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Este é um texto secundário com cor muted para informações menos importantes.
            </p>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Indicadores de Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-success rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-success-foreground text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-card-foreground">Sucesso</h3>
              <p className="text-sm text-muted-foreground">Operação concluída</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-info rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-info-foreground text-xl">ℹ</span>
              </div>
              <h3 className="font-semibold text-card-foreground">Informação</h3>
              <p className="text-sm text-muted-foreground">Dados atualizados</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-warning rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-warning-foreground text-xl">⚠</span>
              </div>
              <h3 className="font-semibold text-card-foreground">Aviso</h3>
              <p className="text-sm text-muted-foreground">Atenção necessária</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-destructive rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-destructive-foreground text-xl">✗</span>
              </div>
              <h3 className="font-semibold text-card-foreground">Erro</h3>
              <p className="text-sm text-muted-foreground">Operação falhou</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border p-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Dark Mode com Amarelo Forte - Design vibrante com gradientes sutis e efeitos glassmorphism
          </p>
        </div>
      </footer>
    </div>
  );
}
