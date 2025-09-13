'use client'

import { Logo, LogoWithGradient, AnimatedLogo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestVisualPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Visual Test Page
          </h1>
          <p className="text-muted-foreground">
            Testing all visual components and styles
          </p>
        </div>

        {/* Logo Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Components</CardTitle>
            <CardDescription>Testing different logo variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Full Logo</h3>
                <Logo variant="full" size="lg" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Compact Logo</h3>
                <Logo variant="compact" size="md" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Icon Only</h3>
                <Logo variant="icon" size="sm" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Logo with Gradient</h3>
                <LogoWithGradient variant="compact" size="lg" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Animated Logo</h3>
                <AnimatedLogo variant="compact" size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Testing button styles and variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>Testing custom color variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
                Primary
              </div>
              <div className="bg-secondary text-secondary-foreground p-4 rounded-lg text-center">
                Secondary
              </div>
              <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center">
                Accent
              </div>
              <div className="bg-muted text-muted-foreground p-4 rounded-lg text-center">
                Muted
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Styles Test */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Styles</CardTitle>
            <CardDescription>Testing custom CSS classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="math-inline">Inline Math: x² + y² = z²</div>
              <div className="math-block">
                Block Math: ∫₀^∞ e^(-x²) dx = √π/2
              </div>
              <div className="math-display">
                {`Display Math: ∑_{n=1}^∞ 1/n² = π²/6`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
