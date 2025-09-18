'use client';

import { useState, useEffect } from 'react';
import { Rocket, Play, Phone, ArrowRight, CheckCircle, BookOpen, Brain, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">
              <span className="text-black">Hub</span>
              <span className="text-yellow-500">Edu</span>
              <span className="text-black">.ia</span>
            </div>
          </div>
          <button 
            disabled
            className="px-6 py-3 bg-gray-400 text-white font-bold rounded-xl cursor-not-allowed"
          >
            EM BREVE
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Rocket className="w-5 h-5" />
            🚀 EM BREVE - A Educação do Futuro
          </div>

          {/* Main Title */}
          <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight text-black">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              HubEdu.ia
            </span>
            <br />
            <span className="text-4xl lg:text-6xl font-bold text-gray-800">
              A Educação do Futuro
            </span>
          </h1>
          
          <p className="text-2xl lg:text-3xl mb-12 text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">
            Plataforma completa de IA para escolas brasileiras: aulas interativas, simulador ENEM, redação automática e chat inteligente.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
              <div className="flex justify-center mb-3">
                <BookOpen className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-yellow-600 mb-2">+3000</div>
              <div className="text-sm font-semibold text-gray-700">Questões Oficiais ENEM</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
              <div className="flex justify-center mb-3">
                <Brain className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-yellow-600 mb-2">∞</div>
              <div className="text-sm font-semibold text-gray-700">Questões Geradas por IA</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
              <div className="flex justify-center mb-3">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-yellow-600 mb-2">45min</div>
              <div className="text-sm font-semibold text-gray-700">Aulas Completas</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
              <div className="flex justify-center mb-3">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-yellow-600 mb-2">100%</div>
              <div className="text-sm font-semibold text-gray-700">Brasileiro</div>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl shadow-2xl rounded-2xl flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-300 cursor-not-allowed"
              disabled
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Em Breve
            </button>
            <button 
              className="px-10 py-5 border-3 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-600 font-bold text-xl rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 cursor-not-allowed"
              disabled
            >
              <Phone className="w-6 h-6" />
              Ver Demonstração
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span>✅ Aulas de 45 minutos geradas por IA</span>
            </div>
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span>✅ Simulador ENEM com +3000 questões oficiais</span>
            </div>
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span>✅ Redação automática com correção ENEM</span>
            </div>
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span>✅ Chat inteligente para toda comunidade escolar</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestPage;
