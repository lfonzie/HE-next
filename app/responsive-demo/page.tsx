'use client';

import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ExampleCard } from '@/components/ui/ResponsiveCard';
import { ExampleGrid } from '@/components/ui/ResponsiveGrid';
import { ExampleButtons } from '@/components/ui/ResponsiveButton';
import { ExampleContainer } from '@/components/ui/ResponsiveContainer';

export default function ResponsiveDemoPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-top">
        <ResponsiveContainer size="lg" padding="md">
          <div className="flex items-center justify-between py-4">
            <h1 className="type-h3 font-bold">Design System Responsivo</h1>
            <div className="flex gap-2">
              <ResponsiveButton size="sm" variant="outline">
                Docs
              </ResponsiveButton>
              <ResponsiveButton size="sm">
                GitHub
              </ResponsiveButton>
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <ResponsiveContainer size="lg" padding="md">
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <h1 className="type-display font-bold">
                Design Mobile-First
              </h1>
              <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                Sistema de design responsivo com tipografia fluida, espaçamento adaptativo 
                e componentes otimizados para mobile e desktop.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ResponsiveButton size="lg">
                  Começar Agora
                </ResponsiveButton>
                <ResponsiveButton size="lg" variant="outline">
                  Ver Exemplos
                </ResponsiveButton>
              </div>
            </section>

            {/* Typography Section */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="type-h2 font-bold">Tipografia Fluida</h2>
                <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                  Sistema de tipografia que se adapta automaticamente ao tamanho da tela usando clamp().
                </p>
              </div>
              
              <ResponsiveCard variant="outlined" padding="lg">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="type-display">Display Text</h1>
                    <p className="type-small text-muted-foreground">--step-6: clamp(3rem, 2.4rem + 2.4vw, 4.5rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="type-h1">Heading 1</h1>
                    <p className="type-small text-muted-foreground">--step-5: clamp(2.5rem, 2rem + 2vw, 3.5rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="type-h2">Heading 2</h2>
                    <p className="type-small text-muted-foreground">--step-4: clamp(2rem, 1.6rem + 1.6vw, 2.75rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="type-h3">Heading 3</h3>
                    <p className="type-small text-muted-foreground">--step-3: clamp(1.5rem, 1.2rem + 1vw, 2rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="type-h4">Heading 4</h4>
                    <p className="type-small text-muted-foreground">--step-2: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="type-body-lg">Body Large</p>
                    <p className="type-small text-muted-foreground">--step-1: clamp(1.125rem, 1rem + 0.5vw, 1.25rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="type-body">Body Text</p>
                    <p className="type-small text-muted-foreground">--step-0: clamp(1rem, 0.95rem + 0.4vw, 1.125rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="type-small">Small Text</p>
                    <p className="type-small text-muted-foreground">--step--1: clamp(0.875rem, 0.8rem + 0.3vw, 0.95rem)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="type-caption">Caption</p>
                    <p className="type-small text-muted-foreground">--step--2: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)</p>
                  </div>
                </div>
              </ResponsiveCard>
            </section>

            {/* Components Section */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="type-h2 font-bold">Componentes Responsivos</h2>
                <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                  Componentes otimizados para mobile com tap targets adequados e layouts adaptativos.
                </p>
              </div>

              <ExampleButtons />
              <ExampleGrid />
              <ExampleCard />
            </section>

            {/* Safe Areas Section */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="type-h2 font-bold">Safe Areas</h2>
                <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                  Suporte automático para notch, ilhas dinâmicas e áreas seguras em dispositivos móveis.
                </p>
              </div>

              <ResponsiveCard variant="elevated" padding="lg">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="type-h4 font-semibold">Classes Safe Area</h3>
                      <div className="space-y-2">
                        <code className="block type-small bg-muted p-2 rounded">.safe-top</code>
                        <code className="block type-small bg-muted p-2 rounded">.safe-bottom</code>
                        <code className="block type-small bg-muted p-2 rounded">.safe-left</code>
                        <code className="block type-small bg-muted p-2 rounded">.safe-right</code>
                        <code className="block type-small bg-muted p-2 rounded">.safe-all</code>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="type-h4 font-semibold">Benefícios</h3>
                      <ul className="space-y-2 type-small text-muted-foreground">
                        <li>• Respeita notch do iPhone</li>
                        <li>• Funciona com ilhas dinâmicas</li>
                        <li>• Compatível com gestos Android</li>
                        <li>• Layout sempre visível</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ResponsiveCard>
            </section>

            {/* Performance Section */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="type-h2 font-bold">Performance Mobile</h2>
                <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                  Otimizações específicas para melhorar a experiência em dispositivos móveis.
                </p>
              </div>

              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
                <ResponsiveCard variant="outlined" padding="md">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="type-h4 font-semibold">Tipografia Fluida</h3>
                    <p className="type-small text-muted-foreground">
                      Usa clamp() para escalar automaticamente sem media queries desnecessárias.
                    </p>
                  </div>
                </ResponsiveCard>

                <ResponsiveCard variant="outlined" padding="md">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="type-h4 font-semibold">Mobile-First</h3>
                    <p className="type-small text-muted-foreground">
                      Design pensado primeiro para mobile, depois refinado para telas maiores.
                    </p>
                  </div>
                </ResponsiveCard>

                <ResponsiveCard variant="outlined" padding="md">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="type-h4 font-semibold">Tap Targets</h3>
                    <p className="type-small text-muted-foreground">
                      Botões e links com mínimo 44x44px para facilitar o toque em mobile.
                    </p>
                  </div>
                </ResponsiveCard>
              </ResponsiveGrid>
            </section>
          </div>
        </ResponsiveContainer>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 safe-bottom">
        <ResponsiveContainer size="lg" padding="md">
          <div className="text-center space-y-4">
            <p className="type-small text-muted-foreground">
              © 2025 HubEdu.ia - Design System Responsivo
            </p>
            <div className="flex justify-center gap-4">
              <ResponsiveButton size="sm" variant="ghost">
                Documentação
              </ResponsiveButton>
              <ResponsiveButton size="sm" variant="ghost">
                GitHub
              </ResponsiveButton>
              <ResponsiveButton size="sm" variant="ghost">
                Suporte
              </ResponsiveButton>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  );
}
