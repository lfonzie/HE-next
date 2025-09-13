'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract token from URL parameters
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token de reset não encontrado na URL');
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!token) {
      setError('Token de reset inválido');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        if (data.expired) {
          setError('Token expirado. Solicite um novo reset de senha.');
        } else if (data.invalid) {
          setError('Token inválido. Solicite um novo reset de senha.');
        } else {
          setError(data.error || 'Erro ao resetar senha');
        }
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Senha Alterada!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full bg-amber-500 hover:bg-amber-600" data-testid="button-login">
                Fazer Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Nova Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha para o HubEdu.ia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-confirm-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600"
              disabled={loading || !newPassword || !confirmPassword || !token}
              data-testid="button-reset-password"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>

            <div className="text-center pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="link-back-login">
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Carregando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
