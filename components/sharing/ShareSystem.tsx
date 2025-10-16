'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare, 
  Link, 
  Download,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Lock,
  Globe
} from 'lucide-react';
import { Trail, Achievement } from '@/types/trails';
import { Achievement as AchievementType } from '@/types/achievements';

interface ShareSystemProps {
  content: Trail | AchievementType | any;
  contentType: 'trail' | 'achievement' | 'lesson' | 'progress';
  userId: string;
  onShare?: (platform: string, data: any) => void;
  className?: string;
}

interface ShareSettings {
  allowPublicSharing: boolean;
  allowSocialSharing: boolean;
  allowEmailSharing: boolean;
  includePersonalInfo: boolean;
  includeProgress: boolean;
  anonymizeData: boolean;
  requireConsent: boolean;
}

interface ShareAnalytics {
  totalShares: number;
  platformShares: Record<string, number>;
  lastShared: string | null;
  consentGiven: boolean;
}

export function ShareSystem({ 
  content, 
  contentType, 
  userId, 
  onShare, 
  className = '' 
}: ShareSystemProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowPublicSharing: false,
    allowSocialSharing: false,
    allowEmailSharing: false,
    includePersonalInfo: false,
    includeProgress: false,
    anonymizeData: true,
    requireConsent: true,
  });
  
  const [analytics, setAnalytics] = useState<ShareAnalytics>({
    totalShares: 0,
    platformShares: {},
    lastShared: null,
    consentGiven: false,
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate shareable content based on type and settings
  const generateShareContent = useCallback(() => {
    const baseContent = {
      title: content.title || content.name,
      description: content.description,
      url: `${window.location.origin}/${contentType}/${content.id}`,
      timestamp: new Date().toISOString(),
    };

    if (shareSettings.anonymizeData) {
      return {
        ...baseContent,
        user: 'Usuário HubEdu.ia',
        progress: shareSettings.includeProgress ? 'Progresso compartilhado' : undefined,
      };
    }

    return {
      ...baseContent,
      user: shareSettings.includePersonalInfo ? `Usuário ${userId}` : 'Usuário HubEdu.ia',
      progress: shareSettings.includeProgress ? getProgressData() : undefined,
    };
  }, [content, contentType, shareSettings, userId]);

  const getProgressData = () => {
    if (contentType === 'trail' && content.progress) {
      return {
        completed: content.progress.completedModules?.length || 0,
        total: content.modules?.length || 0,
        percentage: content.progress.overallProgress || 0,
      };
    }
    return null;
  };

  const getShareUrl = useCallback(() => {
    const shareContent = generateShareContent();
    const params = new URLSearchParams({
      title: shareContent.title,
      description: shareContent.description,
      type: contentType,
      ...(shareContent.progress && { progress: JSON.stringify(shareContent.progress) }),
    });
    
    return `${shareContent.url}?${params.toString()}`;
  }, [generateShareContent, contentType]);

  const handleConsentCheck = useCallback((checked: boolean) => {
    setShareSettings(prev => ({ ...prev, requireConsent: !checked }));
    setAnalytics(prev => ({ ...prev, consentGiven: checked }));
  }, []);

  const handleShare = useCallback(async (platform: string, shareData: any) => {
    if (shareSettings.requireConsent && !analytics.consentGiven) {
      setError('Você deve concordar com os termos de compartilhamento primeiro');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const shareContent = generateShareContent();
      const shareUrl = getShareUrl();

      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          break;

        case 'email':
          const emailSubject = `Compartilhamento: ${shareContent.title}`;
          const emailBody = `
            Olá!
            
            ${shareContent.user} compartilhou "${shareContent.title}" com você.
            
            ${shareContent.description}
            
            Acesse: ${shareUrl}
            
            ${customMessage ? `\nMensagem: ${customMessage}` : ''}
          `;
          
          const emailUrl = `mailto:${emailRecipients}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          window.open(emailUrl);
          break;

        case 'social':
          const socialUrl = getSocialShareUrl(selectedPlatform, shareContent, shareUrl);
          window.open(socialUrl, '_blank', 'width=600,height=400');
          break;

        case 'download':
          const downloadData = {
            ...shareContent,
            exportedAt: new Date().toISOString(),
            platform: 'HubEdu.ia',
          };
          
          const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${shareContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;

        default:
          throw new Error('Plataforma não suportada');
      }

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalShares: prev.totalShares + 1,
        platformShares: {
          ...prev.platformShares,
          [platform]: (prev.platformShares[platform] || 0) + 1,
        },
        lastShared: new Date().toISOString(),
      }));

      // Record share event
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contentType,
          contentId: content.id,
          platform,
          timestamp: new Date().toISOString(),
          settings: shareSettings,
        }),
      });

      onShare?.(platform, shareData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao compartilhar');
    } finally {
      setLoading(false);
    }
  }, [
    shareSettings,
    analytics.consentGiven,
    generateShareContent,
    getShareUrl,
    selectedPlatform,
    customMessage,
    emailRecipients,
    userId,
    contentType,
    content.id,
    onShare,
  ]);

  const getSocialShareUrl = (platform: string, content: any, url: string) => {
    const text = `${content.title} - ${content.description}`;
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
      default:
        return url;
    }
  };

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Share Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
        variant="outline"
        aria-label="Open share options"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartilhar
        {analytics.totalShares > 0 && (
          <Badge variant="secondary" className="ml-2">
            {analytics.totalShares}
          </Badge>
        )}
      </Button>

      {/* Share Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar {contentType === 'trail' ? 'Trilha' : contentType === 'achievement' ? 'Conquista' : 'Conteúdo'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Configurações de Privacidade
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymize"
                    checked={shareSettings.anonymizeData}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, anonymizeData: !!checked }))
                    }
                  />
                  <label htmlFor="anonymize" className="text-sm">
                    Anonimizar dados pessoais
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeProgress"
                    checked={shareSettings.includeProgress}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, includeProgress: !!checked }))
                    }
                  />
                  <label htmlFor="includeProgress" className="text-sm">
                    Incluir progresso
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={analytics.consentGiven}
                    onCheckedChange={handleConsentCheck}
                  />
                  <label htmlFor="consent" className="text-sm">
                    Concordo com os termos de compartilhamento
                  </label>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Share Options */}
            <div className="space-y-4">
              <h4 className="font-semibold">Opções de Compartilhamento</h4>
              
              {/* Copy Link */}
              <div className="flex gap-2">
                <Input
                  value={getShareUrl()}
                  readOnly
                  className="flex-1"
                  placeholder="Link será gerado aqui"
                />
                <Button
                  onClick={() => handleShare('copy', {})}
                  disabled={loading}
                  variant="outline"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Redes Sociais</h5>
                <div className="grid grid-cols-2 gap-2">
                  {socialPlatforms.map(platform => (
                    <Button
                      key={platform.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        handleShare('social', { platform: platform.id });
                      }}
                      disabled={loading}
                      className="justify-start"
                    >
                      <platform.icon className={`w-4 h-4 mr-2 ${platform.color}`} />
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Email</h5>
                <Input
                  placeholder="emails@exemplo.com (separados por vírgula)"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
                <Textarea
                  placeholder="Mensagem personalizada (opcional)"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                />
                <Button
                  onClick={() => handleShare('email', { recipients: emailRecipients, message: customMessage })}
                  disabled={loading || !emailRecipients}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>

              {/* Download */}
              <Button
                onClick={() => handleShare('download', {})}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Dados
              </Button>
            </div>

            {/* Analytics */}
            {analytics.totalShares > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Estatísticas de Compartilhamento
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total de compartilhamentos:</span>
                    <span className="font-medium ml-2">{analytics.totalShares}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Último compartilhamento:</span>
                    <span className="font-medium ml-2">
                      {analytics.lastShared ? new Date(analytics.lastShared).toLocaleDateString() : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
