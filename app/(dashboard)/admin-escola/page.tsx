'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, 
  Users, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  UserPlus,
  Upload,
  Download,
  BarChart3,
  Settings,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  domain: string;
  city?: string;
  state?: string;
  country?: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export default function AdminEscolaPage() {
  const [activeTab, setActiveTab] = useState("schools");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estados para modais
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [isEditSchoolOpen, setIsEditSchoolOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  
  // Estados para formulários
  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    domain: '',
    city: '',
    state: '',
    country: 'Brasil',
    plan: 'basic'
  });
  
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    schoolId: ''
  });

  // Dados mockados
  const [schools, setSchools] = useState<School[]>([
    {
      id: '1',
      name: 'Escola Municipal João Silva',
      domain: 'joaosilva.edu.br',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      plan: 'premium',
      status: 'active',
      usersCount: 25,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'Colégio Estadual Maria Santos',
      domain: 'mariasantos.edu.br',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      plan: 'basic',
      status: 'active',
      usersCount: 15,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-05'
    },
    {
      id: '3',
      name: 'Instituto Federal Pedro Costa',
      domain: 'pedrocosta.edu.br',
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      plan: 'enterprise',
      status: 'pending',
      usersCount: 8,
      createdAt: '2024-02-10',
      updatedAt: '2024-02-12'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@joaosilva.edu.br',
      role: 'ADMIN',
      schoolId: '1',
      status: 'active',
      lastLogin: '2024-01-20'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@mariasantos.edu.br',
      role: 'USER',
      schoolId: '2',
      status: 'active',
      lastLogin: '2024-01-19'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@pedrocosta.edu.br',
      role: 'ADMIN',
      schoolId: '3',
      status: 'inactive',
      lastLogin: '2024-01-15'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="outline">Básico</Badge>;
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge>{plan}</Badge>;
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || school.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddSchool = async () => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSchool: School = {
        id: Date.now().toString(),
        ...schoolFormData,
        status: 'active',
        usersCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setSchools([...schools, newSchool]);
      setIsAddSchoolOpen(false);
      setSchoolFormData({
        name: '',
        domain: '',
        city: '',
        state: '',
        country: 'Brasil',
        plan: 'basic'
      });
      toast.success('Escola adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar escola');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchool = async () => {
    if (!editingSchool) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSchools(schools.map(school => 
        school.id === editingSchool.id 
          ? { ...school, ...schoolFormData, updatedAt: new Date().toISOString().split('T')[0] }
          : school
      ));
      
      setIsEditSchoolOpen(false);
      setEditingSchool(null);
      setSchoolFormData({
        name: '',
        domain: '',
        city: '',
        state: '',
        country: 'Brasil',
        plan: 'basic'
      });
      toast.success('Escola atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar escola');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta escola?')) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSchools(schools.filter(school => school.id !== schoolId));
      toast.success('Escola deletada com sucesso!');
    } catch (error) {
      toast.error('Erro ao deletar escola');
    } finally {
      setLoading(false);
    }
  };

  const openEditSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolFormData({
      name: school.name,
      domain: school.domain,
      city: school.city || '',
      state: school.state || '',
      country: school.country || 'Brasil',
      plan: school.plan
    });
    setIsEditSchoolOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <School className="w-6 h-6 text-green-600" />
              Admin Escola
            </h1>
            <p className="text-gray-600 mt-1">Gestão de escolas e usuários</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Escola
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navegação */}
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Escolas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <TabsContent value="schools" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar escolas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Planos</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Escolas */}
            <Card>
              <CardHeader>
                <CardTitle>Escolas ({filteredSchools.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSchools.map(school => (
                    <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{school.name}</h3>
                            {getStatusBadge(school.status)}
                            {getPlanBadge(school.plan)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Domínio:</strong> {school.domain}</p>
                            <p><strong>Localização:</strong> {school.city}, {school.state} - {school.country}</p>
                            <p><strong>Usuários:</strong> {school.usersCount}</p>
                            <p><strong>Criado em:</strong> {school.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSchool(school)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSchool(school.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Adicionar Usuário
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Importar em Massa
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Lista de usuários será exibida aqui...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Escolas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Dashboard de analytics em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Adicionar Escola */}
      <Dialog open={isAddSchoolOpen} onOpenChange={setIsAddSchoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Escola</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova escola
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Escola</Label>
              <Input
                id="name"
                value={schoolFormData.name}
                onChange={(e) => setSchoolFormData({...schoolFormData, name: e.target.value})}
                placeholder="Ex: Escola Municipal João Silva"
              />
            </div>
            <div>
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                value={schoolFormData.domain}
                onChange={(e) => setSchoolFormData({...schoolFormData, domain: e.target.value})}
                placeholder="Ex: joaosilva.edu.br"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={schoolFormData.city}
                  onChange={(e) => setSchoolFormData({...schoolFormData, city: e.target.value})}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={schoolFormData.state}
                  onChange={(e) => setSchoolFormData({...schoolFormData, state: e.target.value})}
                  placeholder="Ex: SP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select value={schoolFormData.plan} onValueChange={(value) => setSchoolFormData({...schoolFormData, plan: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddSchoolOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSchool} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Escola */}
      <Dialog open={isEditSchoolOpen} onOpenChange={setIsEditSchoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
            <DialogDescription>
              Atualize os dados da escola
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome da Escola</Label>
              <Input
                id="edit-name"
                value={schoolFormData.name}
                onChange={(e) => setSchoolFormData({...schoolFormData, name: e.target.value})}
                placeholder="Ex: Escola Municipal João Silva"
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Domínio</Label>
              <Input
                id="edit-domain"
                value={schoolFormData.domain}
                onChange={(e) => setSchoolFormData({...schoolFormData, domain: e.target.value})}
                placeholder="Ex: joaosilva.edu.br"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  value={schoolFormData.city}
                  onChange={(e) => setSchoolFormData({...schoolFormData, city: e.target.value})}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="edit-state">Estado</Label>
                <Input
                  id="edit-state"
                  value={schoolFormData.state}
                  onChange={(e) => setSchoolFormData({...schoolFormData, state: e.target.value})}
                  placeholder="Ex: SP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-plan">Plano</Label>
              <Select value={schoolFormData.plan} onValueChange={(value) => setSchoolFormData({...schoolFormData, plan: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditSchoolOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSchool} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
