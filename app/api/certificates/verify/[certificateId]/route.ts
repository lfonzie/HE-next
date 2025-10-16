import { NextRequest, NextResponse } from 'next/server';
import { Certificate } from '@/hooks/useBlockchainCertificates';

// Mock database for certificates
const mockCertificates: Certificate[] = [
  {
    id: 'cert_001',
    title: 'Certificado de Conclusão - Matemática ENEM',
    description: 'Certificado de conclusão do curso de Matemática para o ENEM',
    issuer: 'HubEdu.ia',
    recipient: 'João Silva',
    recipientEmail: 'joao@email.com',
    subject: 'Matemática',
    level: 'intermediate',
    issuedAt: '2023-12-01T10:00:00Z',
    expiresAt: '2024-12-01T10:00:00Z',
    blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 12345678,
    network: 'polygon',
    tokenId: '1001',
    metadata: {
      image: '/certificates/math_enem_certificate.png',
      attributes: [
        { trait_type: 'Subject', value: 'Matemática' },
        { trait_type: 'Level', value: 'Intermediário' },
        { trait_type: 'Issuer', value: 'HubEdu.ia' },
        { trait_type: 'Network', value: 'Polygon' },
        { trait_type: 'Rarity', value: 'Common' },
      ],
      description: 'Certificado de conclusão do curso de Matemática para o ENEM',
      external_url: 'https://hubedu.ia/certificates/cert_001',
      background_color: '000000',
    },
    verification: {
      verified: true,
      verificationDate: '2023-12-01T10:05:00Z',
      verifier: 'HubEdu.ia Smart Contract',
      verificationMethod: 'smart_contract',
      proof: '0xproof1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    status: 'active',
  },
  {
    id: 'cert_002',
    title: 'Certificado de Conclusão - Física Fundamental',
    description: 'Certificado de conclusão do curso de Física Fundamental',
    issuer: 'HubEdu.ia',
    recipient: 'Maria Santos',
    recipientEmail: 'maria@email.com',
    subject: 'Física',
    level: 'beginner',
    issuedAt: '2023-11-15T14:30:00Z',
    blockchainHash: '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef',
    transactionHash: '0xbcdef12345678901bcdef12345678901bcdef12345678901bcdef1234567890',
    blockNumber: 12345679,
    network: 'polygon',
    tokenId: '1002',
    metadata: {
      image: '/certificates/physics_fundamental_certificate.png',
      attributes: [
        { trait_type: 'Subject', value: 'Física' },
        { trait_type: 'Level', value: 'Iniciante' },
        { trait_type: 'Issuer', value: 'HubEdu.ia' },
        { trait_type: 'Network', value: 'Polygon' },
        { trait_type: 'Rarity', value: 'Common' },
      ],
      description: 'Certificado de conclusão do curso de Física Fundamental',
      external_url: 'https://hubedu.ia/certificates/cert_002',
      background_color: '000000',
    },
    verification: {
      verified: true,
      verificationDate: '2023-11-15T14:35:00Z',
      verifier: 'HubEdu.ia Smart Contract',
      verificationMethod: 'smart_contract',
      proof: '0xproof2345678901bcdef12345678901bcdef12345678901bcdef12345678901',
    },
    status: 'active',
  },
];

// Verify a certificate
export async function GET(req: NextRequest, { params }: { params: { certificateId: string } }) {
  try {
    const { certificateId } = params;

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // Find the certificate
    const certificate = mockCertificates.find(c => c.id === certificateId);
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // In a real application, this would verify the certificate on the blockchain
    // For now, we'll return the verification information from the certificate
    const verification = {
      verified: certificate.verification.verified,
      verificationDate: certificate.verification.verificationDate,
      verifier: certificate.verification.verifier,
      verificationMethod: certificate.verification.verificationMethod,
      proof: certificate.verification.proof,
      certificate: {
        id: certificate.id,
        title: certificate.title,
        issuer: certificate.issuer,
        recipient: certificate.recipient,
        subject: certificate.subject,
        level: certificate.level,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        blockchainHash: certificate.blockchainHash,
        transactionHash: certificate.transactionHash,
        blockNumber: certificate.blockNumber,
        network: certificate.network,
        tokenId: certificate.tokenId,
        status: certificate.status,
      },
    };

    return NextResponse.json({ verification }, { status: 200 });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}

// Verify certificate by blockchain hash
export async function POST(req: NextRequest) {
  try {
    const { blockchainHash, transactionHash, tokenId } = await req.json();

    if (!blockchainHash && !transactionHash && !tokenId) {
      return NextResponse.json(
        { error: 'At least one verification parameter is required' },
        { status: 400 }
      );
    }

    // Find the certificate by any of the provided parameters
    let certificate: Certificate | undefined;

    if (blockchainHash) {
      certificate = mockCertificates.find(c => c.blockchainHash === blockchainHash);
    } else if (transactionHash) {
      certificate = mockCertificates.find(c => c.transactionHash === transactionHash);
    } else if (tokenId) {
      certificate = mockCertificates.find(c => c.tokenId === tokenId);
    }

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // In a real application, this would verify the certificate on the blockchain
    // For now, we'll return the verification information from the certificate
    const verification = {
      verified: certificate.verification.verified,
      verificationDate: certificate.verification.verificationDate,
      verifier: certificate.verification.verifier,
      verificationMethod: certificate.verification.verificationMethod,
      proof: certificate.verification.proof,
      certificate: {
        id: certificate.id,
        title: certificate.title,
        issuer: certificate.issuer,
        recipient: certificate.recipient,
        subject: certificate.subject,
        level: certificate.level,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        blockchainHash: certificate.blockchainHash,
        transactionHash: certificate.transactionHash,
        blockNumber: certificate.blockNumber,
        network: certificate.network,
        tokenId: certificate.tokenId,
        status: certificate.status,
      },
    };

    return NextResponse.json({ verification }, { status: 200 });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}
