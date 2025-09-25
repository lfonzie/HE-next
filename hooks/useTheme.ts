"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // CORREÇÃO: Melhorar a aplicação da classe no HTML
  useEffect(() => {
    if (mounted && theme) {
      const html = document.documentElement
      const body = document.body
      
      // Remove classes anteriores
      html.classList.remove('light', 'dark')
      
      // Adiciona a classe atual
      html.classList.add(theme)
      
      // Aplicar paleta moderna e sofisticada com azul escuro e gradientes sutis
      if (theme === 'dark') {
        html.style.setProperty('--background', '240 10% 3.9%') // Azul escuro profundo - mais sofisticado
        html.style.setProperty('--foreground', '0 0% 98%') // Branco suave - melhor para os olhos
        html.style.setProperty('--card', '240 10% 5%') // Cards com leve elevação em azul escuro
        html.style.setProperty('--card-foreground', '0 0% 98%') // Texto claro nos cards
        html.style.setProperty('--popover', '240 10% 4%') // Popovers com fundo sutil
        html.style.setProperty('--popover-foreground', '0 0% 98%')
        html.style.setProperty('--primary', '45 100% 60%') // Amarelo forte e vibrante
        html.style.setProperty('--primary-foreground', '0 0% 0%') // Preto sobre amarelo para máximo contraste
        html.style.setProperty('--secondary', '240 10% 8%') // Cinza azulado para elementos secundários
        html.style.setProperty('--secondary-foreground', '0 0% 98%') // Texto claro
        html.style.setProperty('--muted', '240 10% 6%') // Cinza azulado para elementos discretos
        html.style.setProperty('--muted-foreground', '240 5% 64.9%') // Cinza médio para texto muted
        html.style.setProperty('--accent', '240 10% 7%') // Preto quase absoluto para acentos
        html.style.setProperty('--accent-foreground', '0 0% 100%') // Branco cristalino para texto de acento
        html.style.setProperty('--destructive', '0 84% 65%') // Vermelho neon para ações destrutivas
        html.style.setProperty('--destructive-foreground', '0 0% 100%') // Branco cristalino sobre vermelho
        html.style.setProperty('--border', '0 0% 8%') // Bordas em cinza ultra escuro sutil
        html.style.setProperty('--input', '0 0% 2%') // Inputs em preto quase absoluto
        html.style.setProperty('--ring', '45 100% 60%') // Focus ring em amarelo forte
        
              // CORREÇÃO: Aplicar fundo animado moderno
              const body = document.body
              body.classList.add('dark-animated-bg')
              
              // CORREÇÃO: Corrigir contraste em botões
              const buttons = document.querySelectorAll('button')
              buttons.forEach(button => {
                if (button instanceof HTMLElement) {
                  const computedStyle = getComputedStyle(button)
                  const bgColor = computedStyle.backgroundColor
                  const textColor = computedStyle.color
                  
                  // Verificar se tem problema de contraste
                  if (bgColor.includes('rgb(0, 0, 0)') || 
                      bgColor.includes('rgb(17, 17, 17)') ||
                      bgColor.includes('rgb(13, 13, 13)')) {
                    if (textColor.includes('rgb(0, 0, 0)') || 
                        textColor.includes('rgb(17, 17, 17)')) {
                      // Aplicar correção de contraste
                      button.style.backgroundColor = 'hsl(45 93% 47%)' // Amarelo forte
                      button.style.color = 'hsl(222 84% 5%)' // Texto escuro
                      button.style.borderColor = 'hsl(45 93% 47%)'
                    }
                  }
                }
              })
        
        // Adicionar elementos de animação
        const existingParticles = document.querySelector('.floating-particles')
        const existingWaves = document.querySelector('.wave-animation')
        
        if (!existingParticles) {
          const particles = document.createElement('div')
          particles.className = 'floating-particles'
          particles.innerHTML = `
            <div style="position: absolute; top: 30%; left: 20%; width: 3px; height: 3px; background: hsl(45 93% 47% / 0.4); border-radius: 50%; animation: floatParticles 20s linear infinite; animation-delay: 2s;"></div>
            <div style="position: absolute; top: 70%; right: 25%; width: 2px; height: 2px; background: hsl(45 93% 47% / 0.5); border-radius: 50%; animation: floatParticles 25s linear infinite; animation-delay: 8s;"></div>
            <div style="position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: hsl(45 93% 47% / 0.3); border-radius: 50%; animation: floatParticles 18s linear infinite; animation-delay: 12s;"></div>
            <div style="position: absolute; top: 80%; left: 70%; width: 2px; height: 2px; background: hsl(45 93% 47% / 0.6); border-radius: 50%; animation: floatParticles 22s linear infinite; animation-delay: 15s;"></div>
            <div style="position: absolute; top: 25%; right: 40%; width: 3px; height: 3px; background: hsl(45 93% 47% / 0.4); border-radius: 50%; animation: floatParticles 16s linear infinite; animation-delay: 6s;"></div>
          `
          body.appendChild(particles)
        }
        
        if (!existingWaves) {
          const waves = document.createElement('div')
          waves.className = 'wave-animation'
          body.appendChild(waves)
        }
        
        // CORREÇÃO GLOBAL: Forçar tema escuro apenas em elementos com backgrounds claros
        const elementsWithLightBg = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-slate-50, .bg-yellow-50, .bg-orange-50, .bg-gray-100, .bg-gray-200, .bg-gray-300, .bg-slate-100, .bg-slate-200, .bg-slate-300, .bg-zinc-50, .bg-zinc-100, .bg-zinc-200, .bg-neutral-50, .bg-neutral-100, .bg-neutral-200, .bg-stone-50, .bg-stone-100, .bg-stone-200, [class*="bg-gradient"], .container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm, .w-full, .h-full, .min-h-screen, .min-h-full, .h-screen, .h-full')
        elementsWithLightBg.forEach(el => {
          if (el instanceof HTMLElement) {
            // Remover classes de background claro
            el.classList.remove('bg-white', 'bg-gray-50', 'bg-slate-50', 'bg-yellow-50', 'bg-orange-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-zinc-50', 'bg-zinc-100', 'bg-zinc-200', 'bg-neutral-50', 'bg-neutral-100', 'bg-neutral-200', 'bg-stone-50', 'bg-stone-100', 'bg-stone-200')
            el.classList.remove('bg-gradient-to-br', 'from-slate-50', 'via-yellow-50', 'to-orange-100')
            el.classList.remove('from-yellow-50', 'to-orange-50')
            
            // Aplicar background moderno se necessário
            if (el.classList.contains('min-h-screen') || 
                el.classList.contains('container') ||
                el.classList.contains('w-full') ||
                el.classList.contains('h-full') ||
                el.style.backgroundColor.includes('rgb(255, 255, 255)') ||
                el.style.backgroundColor.includes('rgb(248, 250, 252)') ||
                el.style.backgroundColor.includes('rgb(249, 250, 251)') ||
                el.style.backgroundColor.includes('rgb(243, 244, 246)') ||
                el.style.backgroundColor.includes('rgb(229, 231, 235)')) {
              el.style.backgroundColor = 'hsl(222 84% 5%)' // Azul escuro profundo
              el.style.color = 'hsl(0 0% 98%)' // Branco quase puro
            }
          }
        })
      } else {
        // CORREÇÃO: Tema claro deve ter fundo claro
        html.style.setProperty('--background', '0 0% 100%')
        html.style.setProperty('--foreground', '222.2 84% 4.9%')
        html.style.setProperty('--card', '0 0% 100%')
        html.style.setProperty('--card-foreground', '222.2 84% 4.9%')
        html.style.setProperty('--primary', '45 93% 47%')
        html.style.setProperty('--secondary-foreground', '222.2 84% 4.9%')
        html.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%')
        html.style.setProperty('--accent', '210 40% 96%')
        html.style.setProperty('--border', '214.3 31.8% 91.4%')
        html.style.setProperty('--ring', '45 93% 47%')
        
        // CORREÇÃO: Remover fundo animado do tema escuro
        const body = document.body
        body.classList.remove('dark-animated-bg')
        
        // Remover elementos de animação
        const existingParticles = document.querySelector('.floating-particles')
        const existingWaves = document.querySelector('.wave-animation')
        
        if (existingParticles) existingParticles.remove()
        if (existingWaves) existingWaves.remove()
        
        // Forçar cores no body também
        body.style.backgroundColor = '#ffffff'
        body.style.color = '#000000'
        
        // CORREÇÃO: Remover backgrounds escuros no tema claro
        const elementsWithDarkBg = document.querySelectorAll('.bg-black, .bg-gray-900, .bg-gray-800, [class*="bg-gray-9"], [class*="bg-gray-8"], .container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm, .w-full, .h-full, .min-h-screen, .min-h-full, .h-screen, .h-full')
        elementsWithDarkBg.forEach(el => {
          if (el instanceof HTMLElement) {
            // Remover classes de background escuro
            el.classList.remove('bg-black', 'bg-gray-900', 'bg-gray-800')
            
            // Aplicar background claro se necessário
            if (el.classList.contains('min-h-screen') || 
                el.classList.contains('container') ||
                el.classList.contains('w-full') ||
                el.classList.contains('h-full') ||
                el.style.backgroundColor.includes('rgb(0, 0, 0)') ||
                el.style.backgroundColor.includes('rgb(17, 24, 39)') ||
                el.style.backgroundColor.includes('rgb(17, 17, 17)')) {
              el.style.backgroundColor = '#ffffff'
              el.style.color = '#000000'
            }
          }
        })
      }
      
      // Log detalhado para debug
      console.log('🎨 useTheme - Theme applied:', {
        theme,
        resolvedTheme,
        systemTheme,
        htmlClass: html.className,
        htmlBackground: html.style.getPropertyValue('--background'),
        bodyBackground: body.style.backgroundColor,
        timestamp: new Date().toISOString()
      })
      
      // Verificar se a classe foi aplicada corretamente
      setTimeout(() => {
        const currentClass = html.className.includes('dark') ? 'dark' : 'light'
        const computedStyle = getComputedStyle(html)
        const bodyComputedStyle = getComputedStyle(body)
        
        console.log('🎨 useTheme - Verificação:', {
          expectedTheme: theme,
          actualClass: currentClass,
          success: currentClass === theme,
          computedBackground: computedStyle.getPropertyValue('--background'),
          bodyComputedBackground: bodyComputedStyle.backgroundColor,
          bodyComputedColor: bodyComputedStyle.color
        })
      }, 100)
    }
  }, [theme, resolvedTheme, mounted])

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    mounted
  }
}
