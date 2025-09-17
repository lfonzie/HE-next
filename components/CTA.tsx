'use client'

import { ArrowRight, Mail } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join thousands of developers who are already building amazing applications with HE Next.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-white/90 transition-colors">
            Start Building
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
            <Mail className="mr-2 w-5 h-5" />
            Contact Us
          </button>
        </div>
        
        <div className="text-sm text-white/70">
          <p>No credit card required • Free to get started • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
