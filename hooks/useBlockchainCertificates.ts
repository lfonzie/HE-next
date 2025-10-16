import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Award, 
  Download, 
  Share2, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Copy,
  QrCode,
  Calendar,
  Clock,
  User,
  BookOpen,
  Star,
  Lock,
  Unlock
} from 'lucide-react';

// Types for blockchain certificates
interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  issuedAt: string;
  expiresAt?: string;
  blockchainHash: string;
  transactionHash: string;
  blockNumber: number;
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum';
  tokenId: string;
  metadata: CertificateMetadata;
  verification: CertificateVerification;
  status: 'active' | 'expired' | 'revoked' | 'pending';
}

interface CertificateMetadata {
  image: string;
  attributes: CertificateAttribute[];
  description: string;
  external_url: string;
  background_color: string;
  animation_url?: string;
}

interface CertificateAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'boost_number' | 'boost_percentage' | 'date';
}

interface CertificateVerification {
  verified: boolean;
  verificationDate: string;
  verifier: string;
  verificationMethod: 'smart_contract' | 'api' | 'manual';
  proof: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: CertificateAttribute[];
  requirements: CertificateRequirement[];
  issuer: string;
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum';
  contractAddress: string;
  price: number; // in ETH or other tokens
  active: boolean;
}

interface CertificateRequirement {
  id: string;
  type: 'course_completion' | 'quiz_score' | 'project_submission' | 'time_spent' | 'attendance';
  description: string;
  threshold: number;
  required: boolean;
}

interface CertificateIssuance {
  id: string;
  templateId: string;
  recipientId: string;
  recipientEmail: string;
  status: 'pending' | 'processing' | 'issued' | 'failed';
  transactionHash?: string;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

// Blockchain Certificate Hook
export function useBlockchainCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuances, setIssuances] = useState<CertificateIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Connect to blockchain
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } else {
        throw new Error('MetaMask não está instalado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao conectar carteira');
    } finally {
      setLoading(false);
    }
  }, []);

  // Issue certificate
  const issueCertificate = useCallback(async (
    templateId: string,
    recipientEmail: string,
    recipientId: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!isConnected || !walletAddress) {
        throw new Error('Carteira não conectada');
      }

      // Create issuance record
      const issuance: CertificateIssuance = {
        id: `issuance_${Date.now()}`,
        templateId,
        recipientId,
        recipientEmail,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setIssuances(prev => [...prev, issuance]);

      // Call smart contract to issue certificate
      const result = await callSmartContract('issueCertificate', [
        templateId,
        recipientEmail,
        recipientId,
      ]);

      if (result.success) {
        // Update issuance status
        setIssuances(prev =>
          prev.map(iss =>
            iss.id === issuance.id
              ? { ...iss, status: 'processing', transactionHash: result.transactionHash }
              : iss
          )
        );

        // Wait for transaction confirmation
        await waitForTransactionConfirmation(result.transactionHash);

        // Update issuance status to issued
        setIssuances(prev =>
          prev.map(iss =>
            iss.id === issuance.id
              ? { ...iss, status: 'issued', processedAt: new Date().toISOString() }
              : iss
          )
        );

        // Refresh certificates
        await fetchCertificates();
      } else {
        throw new Error(result.error || 'Falha ao emitir certificado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao emitir certificado');
      
      // Update issuance status to failed
      setIssuances(prev =>
        prev.map(iss =>
          iss.id === `issuance_${Date.now()}`
            ? { ...iss, status: 'failed', error: err instanceof Error ? err.message : 'Erro desconhecido' }
            : iss
        )
      );
    } finally {
      setLoading(false);
    }
  }, [isConnected, walletAddress]);

  // Verify certificate
  const verifyCertificate = useCallback(async (certificateId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/certificates/verify/${certificateId}`);
      if (!response.ok) {
        throw new Error('Falha ao verificar certificado');
      }

      const verification = await response.json();
      return verification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao verificar certificado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/certificates');
      if (!response.ok) {
        throw new Error('Falha ao buscar certificados');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar certificados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/certificates/templates');
      if (!response.ok) {
        throw new Error('Falha ao buscar templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar templates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Call smart contract
  const callSmartContract = useCallback(async (method: string, params: any[]) => {
    try {
      // This would integrate with a Web3 library like ethers.js or web3.js
      // For now, we'll simulate the contract call
      
      const contractAddress = '0x1234567890123456789012345678901234567890'; // Mock contract address
      const contractABI = []; // Mock ABI

      const result = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: contractAddress,
            data: encodeContractCall(method, params, contractABI),
            from: walletAddress,
          },
        ],
      });

      return {
        success: true,
        transactionHash: result,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Falha na transação',
      };
    }
  }, [walletAddress]);

  // Wait for transaction confirmation
  const waitForTransactionConfirmation = useCallback(async (transactionHash: string) => {
    // This would wait for the transaction to be confirmed on the blockchain
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, []);

  // Encode contract call
  const encodeContractCall = useCallback((method: string, params: any[], abi: any[]) => {
    // This would encode the contract call using a library like ethers.js
    // For now, we'll return a mock encoded call
    return '0x' + '0'.repeat(64);
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchCertificates();
    fetchTemplates();
  }, [fetchCertificates, fetchTemplates]);

  return {
    certificates,
    templates,
    issuances,
    loading,
    error,
    isConnected,
    walletAddress,
    connectWallet,
    issueCertificate,
    verifyCertificate,
    fetchCertificates,
    fetchTemplates,
  };
}

// Certificate Component
interface CertificateProps {
  certificate: Certificate;
  onVerify?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  onDownload?: (certificate: Certificate) => void;
}

export function Certificate({ certificate, onVerify, onShare, onDownload }: CertificateProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerification | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleVerify = useCallback(async () => {
    setIsVerifying(true);
    try {
      const result = await verifyCertificate(certificate.id);
      setVerificationResult(result);
      onVerify?.(certificate);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  }, [certificate, onVerify]);

  const handleShare = useCallback(() => {
    onShare?.(certificate);
  }, [certificate, onShare]);

  const handleDownload = useCallback(() => {
    onDownload?.(certificate);
  }, [certificate, onDownload]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expired': return 'text-yellow-600';
      case 'revoked': return 'text-red-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'revoked': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{certificate.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{certificate.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(certificate.status)}>
              {getStatusIcon(certificate.status)}
              <span className="ml-1 capitalize">{certificate.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Certificate Image */}
        <div className="relative">
          <img
            src={certificate.metadata.image}
            alt={certificate.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {certificate.level.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Emitido por:</span>
            <p className="text-gray-600">{certificate.issuer}</p>
          </div>
          <div>
            <span className="font-semibold">Rede:</span>
            <p className="text-gray-600 capitalize">{certificate.network}</p>
          </div>
          <div>
            <span className="font-semibold">Data de Emissão:</span>
            <p className="text-gray-600">
              {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <span className="font-semibold">Expira em:</span>
            <p className="text-gray-600">
              {certificate.expiresAt 
                ? new Date(certificate.expiresAt).toLocaleDateString('pt-BR')
                : 'Não expira'
              }
            </p>
          </div>
        </div>

        {/* Blockchain Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Informações Blockchain:</h4>
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hash do Certificado:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(certificate.blockchainHash)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs font-mono text-gray-600 break-all">
              {certificate.blockchainHash}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hash da Transação:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(certificate.transactionHash)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs font-mono text-gray-600 break-all">
              {certificate.transactionHash}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Token ID:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(certificate.tokenId)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs font-mono text-gray-600">
              {certificate.tokenId}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        {verificationResult && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Status de Verificação:</h4>
            <div className={`p-3 rounded-lg ${
              verificationResult.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {verificationResult.verified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`font-semibold ${
                  verificationResult.verified ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationResult.verified ? 'Verificado' : 'Não Verificado'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Verificado em: {new Date(verificationResult.verificationDate).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">
                Método: {verificationResult.verificationMethod}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleVerify}
            disabled={isVerifying}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Verificar
          </Button>
          
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            size="sm"
          >
            <QrCode className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="inline-block p-4 bg-white rounded-lg">
              {/* QR Code would be generated here */}
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Escaneie para verificar o certificado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Certificate Template Component
interface CertificateTemplateProps {
  template: CertificateTemplate;
  onIssue?: (template: CertificateTemplate) => void;
}

export function CertificateTemplate({ template, onIssue }: CertificateTemplateProps) {
  const handleIssue = useCallback(() => {
    onIssue?.(template);
  }, [template, onIssue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          {template.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{template.network.toUpperCase()}</Badge>
          <Badge variant="outline">{template.active ? 'Ativo' : 'Inativo'}</Badge>
        </div>
        
        <p className="text-gray-600">{template.description}</p>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Requisitos:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {template.requirements.map((req, index) => (
              <li key={index}>{req.description}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">Preço:</span>
            <span className="text-gray-600 ml-1">{template.price} ETH</span>
          </div>
          
          <Button onClick={handleIssue} size="sm">
            <Award className="w-4 h-4 mr-2" />
            Emitir Certificado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
