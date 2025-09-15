"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Database,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  dataRetentionDays: number;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowDataSharing: boolean;
  anonymizeData: boolean;
}

interface PrivacyReport {
  totalSessions: number;
  totalResponses: number;
  totalScores: number;
  dataRetentionPolicy: string;
  lastDataUpdate: Date;
  dataTypes: string[];
}

export function EnemPrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataRetentionDays: 547, // 18 months
    allowAnalytics: true,
    allowPersonalization: true,
    allowDataSharing: false,
    anonymizeData: false
  });

  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    setLoading(true);
    try {
      // Load privacy report
      const response = await fetch('/api/enem/privacy/report');
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error loading privacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/enem/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Configurações de privacidade salvas com sucesso!",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/enem/privacy/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meus-dados-enem-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sucesso",
          description: "Seus dados foram exportados com sucesso!",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const requestDataDeletion = async () => {
    try {
      const response = await fetch('/api/enem/privacy/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Solicitação do usuário'
        })
      });

      if (response.ok) {
        toast({
          title: "Solicitação Enviada",
          description: "Sua solicitação de exclusão de dados foi enviada e será processada em até 30 dias.",
        });
        setShowDeleteConfirmation(false);
      } else {
        throw new Error('Deletion request failed');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidade e Proteção de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Conformidade com LGPD</h4>
                <p className="text-blue-800 text-sm">
                  Este simulador ENEM está em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
                  Você tem controle total sobre seus dados pessoais.
                </p>
              </div>
            </div>
          </div>

          {report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{report.totalSessions}</div>
                <div className="text-sm text-gray-600">Simulados Realizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{report.totalResponses}</div>
                <div className="text-sm text-gray-600">Respostas Registradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{report.totalScores}</div>
                <div className="text-sm text-gray-600">Pontuações Calculadas</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Configurações de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Retention */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Período de Retenção de Dados</Label>
                <p className="text-sm text-gray-600">
                  Seus dados serão mantidos por {settings.dataRetentionDays} dias ({Math.round(settings.dataRetentionDays / 30)} meses)
                </p>
              </div>
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                {settings.dataRetentionDays} dias
              </Badge>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Permitir Análises</Label>
              <p className="text-sm text-gray-600">
                Coleta dados de uso para melhorar o simulador
              </p>
            </div>
            <Switch
              checked={settings.allowAnalytics}
              onCheckedChange={(checked) => handleSettingChange('allowAnalytics', checked)}
            />
          </div>

          {/* Personalization */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Personalização</Label>
              <p className="text-sm text-gray-600">
                Usa seus dados para personalizar a experiência
              </p>
            </div>
            <Switch
              checked={settings.allowPersonalization}
              onCheckedChange={(checked) => handleSettingChange('allowPersonalization', checked)}
            />
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Compartilhamento de Dados</Label>
              <p className="text-sm text-gray-600">
                Permite compartilhamento anônimo para pesquisa educacional
              </p>
            </div>
            <Switch
              checked={settings.allowDataSharing}
              onCheckedChange={(checked) => handleSettingChange('allowDataSharing', checked)}
            />
          </div>

          {/* Anonymization */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Anonimização Automática</Label>
              <p className="text-sm text-gray-600">
                Remove identificadores pessoais dos dados após 6 meses
              </p>
            </div>
            <Switch
              checked={settings.anonymizeData}
              onCheckedChange={(checked) => handleSettingChange('anonymizeData', checked)}
            />
          </div>

          <Button onClick={saveSettings} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Types */}
          <div>
            <h4 className="font-semibold mb-3">Tipos de Dados Coletados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report?.dataTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={exportData} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Meus Dados
            </Button>

            <Button 
              onClick={() => setShowDeleteConfirmation(true)} 
              variant="destructive" 
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Solicitar Exclusão de Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion Confirmation */}
      {showDeleteConfirmation && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-800">
                <strong>Atenção:</strong> Esta ação irá excluir permanentemente todos os seus dados 
                do simulador ENEM, incluindo:
              </p>
              <ul className="list-disc list-inside text-red-800 space-y-1">
                <li>Todos os simulados realizados</li>
                <li>Respostas e pontuações</li>
                <li>Histórico de desempenho</li>
                <li>Configurações personalizadas</li>
              </ul>
              <p className="text-red-800">
                Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={requestDataDeletion} 
                  variant="destructive"
                  className="flex-1"
                >
                  Sim, Excluir Dados
                </Button>
                <Button 
                  onClick={() => setShowDeleteConfirmation(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Policy Link */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Para mais informações sobre como protegemos seus dados:
            </p>
            <Button variant="link" className="text-blue-600">
              Política de Privacidade Completa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
