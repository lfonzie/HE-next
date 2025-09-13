'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { User, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';

interface DemoRegistration {
  name: string;
  email: string;
  phone: string;
}

export default function DemoRegister() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<DemoRegistration>({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem pelo menos 10 dígitos (formato brasileiro)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const formatPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    return phone;
  };

  const handleInputChange = (field: keyof DemoRegistration, value: string) => {
    if (field === 'phone') {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, informe um e-mail válido.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: 'Celular inválido',
        description: 'Por favor, informe um celular válido (10 ou 11 dígitos).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/demo/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.replace(/\D/g, ''),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar dados do usuário demo no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('demoUser', JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.replace(/\D/g, ''),
            registeredAt: new Date().toISOString(),
          }));
        }

        setIsRegistered(true);
        
        toast({
          title: 'Cadastro realizado!',
          description: 'Você pode agora acessar o modo demo.',
          variant: 'default',
        });

        // Redirecionar para o demo após 2 segundos
        setTimeout(() => {
          router.push('/demo');
        }, 2000);
      } else {
        throw new Error(data.message || 'Erro ao realizar cadastro');
      }
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Não foi possível realizar o cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cadastro realizado com sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Você será redirecionado para o modo demo em instantes...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/assets/Logo_HubEdu.ia.svg"
              alt="HubEdu.ia"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo HubEdu.ia
          </h1>
          <p className="text-gray-600">
            Cadastre-se para acessar o modo demonstração
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Cadastro para Demo
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              Preencha os dados abaixo para acessar o modo demonstração
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Celular *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Limitação do Demo:</p>
                <p>• Apenas 1 demo por e-mail/celular</p>
                <p>• Máximo de 5 mensagens no chat</p>
                <p>• Acesso por 24 horas</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Acessar Demo'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
