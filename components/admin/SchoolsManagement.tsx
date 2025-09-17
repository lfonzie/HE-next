'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search, Building2, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

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

interface EditSchoolFormData {
  name: string;
  domain: string;
  city?: string;
  state?: string;
  country?: string;
}

export function SchoolsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditSchoolFormData>({
    name: "",
    domain: "",
    city: "",
    state: "",
    country: ""
  });

  // Dados mockados
  const [schools, setSchools] = useState<School[]>([
    {
      id: "1",
      name: "Escola Municipal João Silva",
      domain: "joaosilva.edu.br",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      plan: "premium",
      status: "active",
      usersCount: 25,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: "2",
      name: "Colégio Estadual Maria Santos",
      domain: "mariasantos.edu.br",
      city: "Rio de Janeiro",
      state: "RJ",
      country: "Brasil",
      plan: "basic",
      status: "active",
      usersCount: 15,
      createdAt: "2024-02-01",
      updatedAt: "2024-02-05"
    },
    {
      id: "3",
      name: "Instituto Federal Pedro Costa",
      domain: "pedrocosta.edu.br",
      city: "Belo Horizonte",
      state: "MG",
      country: "Brasil",
      plan: "enterprise",
      status: "pending",
      usersCount: 8,
      createdAt: "2024-02-10",
      updatedAt: "2024-02-12"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
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
    const matchesPlan = planFilter === "all" || school.plan === planFilter;
    const matchesStatus = statusFilter === "all" || school.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setEditFormData({
      name: school.name,
      domain: school.domain,
      city: school.city || "",
      state: school.state || "",
      country: school.country || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveSchool = () => {
    if (editingSchool) {
      setSchools(schools.map(school => 
        school.id === editingSchool.id 
          ? { ...school, ...editFormData, updatedAt: new Date().toISOString().split('T')[0] }
          : school
      ));
      setIsEditDialogOpen(false);
      setEditingSchool(null);
      toast.success("Escola atualizada com sucesso!");
    }
  };

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a escola "${schoolName}"? Esta ação não pode ser desfeita.`)) {
      setSchools(schools.filter(school => school.id !== schoolId));
      toast.success("Escola deletada com sucesso!");
    }
  };

  const handleAddSchool = () => {
    const newSchool: School = {
      id: Date.now().toString(),
      ...editFormData,
      plan: "basic",
      status: "active",
      usersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setSchools([...schools, newSchool]);
    setIsAddDialogOpen(false);
    setEditFormData({
      name: "",
      domain: "",
      city: "",
      state: "",
      country: ""
    });
    toast.success("Escola adicionada com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Escolas</h2>
          <p className="text-gray-600 mt-1">Gerencie escolas e suas configurações</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Escola
        </Button>
      </div>

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
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Escolas ({filteredSchools.length})
          </CardTitle>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span><strong>Domínio:</strong> {school.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span><strong>Usuários:</strong> {school.usersCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span><strong>Criado:</strong> {school.createdAt}</span>
                      </div>
                      <div>
                        <span><strong>Localização:</strong> {school.city}, {school.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSchool(school)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSchool(school.id, school.name)}
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

      {/* Modal Editar Escola */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Ex: Escola Municipal João Silva"
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Domínio</Label>
              <Input
                id="edit-domain"
                value={editFormData.domain}
                onChange={(e) => setEditFormData({...editFormData, domain: e.target.value})}
                placeholder="Ex: joaosilva.edu.br"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="edit-state">Estado</Label>
                <Input
                  id="edit-state"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                  placeholder="Ex: SP"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSchool}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Escola */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Escola</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova escola
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Nome da Escola</Label>
              <Input
                id="add-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Ex: Escola Municipal João Silva"
              />
            </div>
            <div>
              <Label htmlFor="add-domain">Domínio</Label>
              <Input
                id="add-domain"
                value={editFormData.domain}
                onChange={(e) => setEditFormData({...editFormData, domain: e.target.value})}
                placeholder="Ex: joaosilva.edu.br"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-city">Cidade</Label>
                <Input
                  id="add-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="add-state">Estado</Label>
                <Input
                  id="add-state"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                  placeholder="Ex: SP"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSchool}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
