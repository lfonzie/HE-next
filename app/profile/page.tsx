'use client';

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useToast } from "../../hooks/use-toast";
import { signOut } from "next-auth/react";

export default function Profile() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const [profileImage, setProfileImage] = useState<string>(session?.user?.image || "");

  // Sync with user data when it changes
  React.useEffect(() => {
    if (session?.user?.image) {
      setProfileImage(session.user.image);
    }
  }, [session?.user?.image]);

  const handleImageUpdate = (imageUrl: string) => {
    setProfileImage(imageUrl);
    // Update session with new image
    update({ image: imageUrl });
    toast({
      title: "Foto atualizada",
      description: "Sua foto de perfil foi atualizada com sucesso!",
    });
  };

  const updateProfileMutation = async ({ name }: { name: string }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar perfil');
      }

      // Update session with new name
      await update({ name: name.trim() });
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      updateProfileMutation({ name: name.trim() });
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleCancel = () => {
    setName(session?.user?.name || "");
    setIsEditing(false);
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="mb-4"
              data-testid="button-back"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meu Perfil
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Gerencie suas informações pessoais
            </p>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{session.user.name}</CardTitle>
                    <p className="text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simple image upload placeholder
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const imageUrl = e.target?.result as string;
                          handleImageUpdate(imageUrl);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  Alterar Foto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      data-testid="input-name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white" data-testid="text-name">
                      {session.user.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mail
                  </label>
                  <p className="text-gray-900 dark:text-white" data-testid="text-email">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      data-testid="button-save"
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logout Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Sair da Conta
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Desconecte-se do sistema
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
