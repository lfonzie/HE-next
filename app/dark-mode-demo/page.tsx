"use client";

import { ThemeToggle, ThemeToggleWithText } from "@/components/ui/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function DarkModeDemo() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Demonstração do Dark Mode
          </h1>
          <p className="text-muted-foreground text-lg">
            Tema atual: <Badge variant="outline">{theme === "light" ? "Claro" : "Escuro"}</Badge>
          </p>
          <div className="flex justify-center gap-4">
            <ThemeToggle size="lg" />
            <ThemeToggleWithText />
          </div>
        </div>

        <Separator />

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards e Componentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Padrão</CardTitle>
                <CardDescription>
                  Este é um card de exemplo para demonstrar o dark mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  O conteúdo do card se adapta automaticamente ao tema selecionado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Card Destacado</CardTitle>
                <CardDescription>
                  Card com borda colorida usando a cor primária
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Botão Primário</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card com Badges</CardTitle>
                <CardDescription>
                  Demonstração de badges em diferentes variantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge>Padrão</Badge>
                  <Badge variant="secondary">Secundário</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destrutivo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Formulários</h2>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Formulário de Exemplo</CardTitle>
              <CardDescription>
                Todos os campos se adaptam ao tema selecionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Digite seu nome" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Digite seu email" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea 
                  id="message" 
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button>Enviar</Button>
                <Button variant="outline">Cancelar</Button>
                <Button variant="secondary">Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Progress Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Barras de Progresso</h2>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Progresso de Carregamento</CardTitle>
              <CardDescription>
                Demonstração de barras de progresso no dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Progresso: 25%</Label>
                <Progress value={25} />
              </div>
              
              <div className="space-y-2">
                <Label>Progresso: 50%</Label>
                <Progress value={50} />
              </div>
              
              <div className="space-y-2">
                <Label>Progresso: 75%</Label>
                <Progress value={75} />
              </div>
              
              <div className="space-y-2">
                <Label>Progresso: 100%</Label>
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Color Palette Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Paleta de Cores</h2>
          <Card>
            <CardHeader>
              <CardTitle>Inspirado na Tela de Loading</CardTitle>
              <CardDescription>
                Cores baseadas no design da tela de loading com tons de cinza escuro e acentos laranja/amarelo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-16 w-full bg-background border border-border rounded"></div>
                  <p className="text-sm font-medium">Background</p>
                  <p className="text-xs text-muted-foreground">Cor de fundo principal</p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-16 w-full bg-card border border-border rounded"></div>
                  <p className="text-sm font-medium">Card</p>
                  <p className="text-xs text-muted-foreground">Cor de fundo dos cards</p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-16 w-full bg-primary rounded"></div>
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground">Cor primária (laranja)</p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-16 w-full bg-secondary border border-border rounded"></div>
                  <p className="text-sm font-medium">Secondary</p>
                  <p className="text-xs text-muted-foreground">Cor secundária</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground py-8">
          <p>Dark Mode inspirado nas cores da tela de loading do HubEdu.ia</p>
          <p className="text-sm mt-2">
            Tons de cinza escuro com acentos em laranja vibrante (#f97316) e amarelo dourado (#fbbf24)
          </p>
        </footer>
      </div>
    </div>
  );
}
