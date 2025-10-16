import { NextRequest, NextResponse } from 'next/server';
import { Certificate, CertificateTemplate, CertificateIssuance } from '@/hooks/useBlockchainCertificates';

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

// Mock database for certificate templates
const mockTemplates: CertificateTemplate[] = [
  {
    id: 'template_001',
    name: 'Certificado de Conclusão - Matemática ENEM',
    description: 'Template para certificado de conclusão do curso de Matemática para o ENEM',
    image: '/certificates/templates/math_enem_template.png',
    attributes: [
      { trait_type: 'Subject', value: 'Matemática' },
      { trait_type: 'Level', value: 'Intermediário' },
      { trait_type: 'Issuer', value: 'HubEdu.ia' },
      { trait_type: 'Network', value: 'Polygon' },
      { trait_type: 'Rarity', value: 'Common' },
    ],
    requirements: [
      {
        id: 'req_001',
        type: 'course_completion',
        description: 'Completar 100% do curso de Matemática ENEM',
        threshold: 100,
        required: true,
      },
      {
        id: 'req_002',
        type: 'quiz_score',
        description: 'Obter pelo menos 70% de acerto nos quizzes',
        threshold: 70,
        required: true,
      },
    ],
    issuer: 'HubEdu.ia',
    network: 'polygon',
    contractAddress: '0x1234567890123456789012345678901234567890',
    price: 0.01, // 0.01 ETH
    active: true,
  },
  {
    id: 'template_002',
    name: 'Certificado de Conclusão - Física Fundamental',
    description: 'Template para certificado de conclusão do curso de Física Fundamental',
    image: '/certificates/templates/physics_fundamental_template.png',
    attributes: [
      { trait_type: 'Subject', value: 'Física' },
      { trait_type: 'Level', value: 'Iniciante' },
      { trait_type: 'Issuer', value: 'HubEdu.ia' },
      { trait_type: 'Network', value: 'Polygon' },
      { trait_type: 'Rarity', value: 'Common' },
    ],
    requirements: [
      {
        id: 'req_003',
        type: 'course_completion',
        description: 'Completar 100% do curso de Física Fundamental',
        threshold: 100,
        required: true,
      },
      {
        id: 'req_004',
        type: 'project_submission',
        description: 'Submeter projeto final',
        threshold: 1,
        required: true,
      },
    ],
    issuer: 'HubEdu.ia',
    network: 'polygon',
    contractAddress: '0x1234567890123456789012345678901234567890',
    price: 0.01, // 0.01 ETH
    active: true,
  },
];

// Mock database for certificate issuances
const mockIssuances: CertificateIssuance[] = [
  {
    id: 'issuance_001',
    templateId: 'template_001',
    recipientId: 'user_001',
    recipientEmail: 'joao@email.com',
    status: 'issued',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    createdAt: '2023-12-01T10:00:00Z',
    processedAt: '2023-12-01T10:05:00Z',
  },
  {
    id: 'issuance_002',
    templateId: 'template_002',
    recipientId: 'user_002',
    recipientEmail: 'maria@email.com',
    status: 'issued',
    transactionHash: '0xbcdef12345678901bcdef12345678901bcdef12345678901bcdef1234567890',
    createdAt: '2023-11-15T14:30:00Z',
    processedAt: '2023-11-15T14:35:00Z',
  },
];

// Get all certificates
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const recipientEmail = req.nextUrl.searchParams.get('recipientEmail');

    let filteredCertificates = mockCertificates;

    if (userId) {
      // Filter by user ID (in a real app, you'd query the database)
      filteredCertificates = mockCertificates.filter(cert => 
        cert.recipient === userId || cert.recipientEmail === userId
      );
    }

    if (recipientEmail) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.recipientEmail === recipientEmail
      );
    }

    return NextResponse.json({ certificates: filteredCertificates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

// Issue a new certificate
export async function POST(req: NextRequest) {
  try {
    const { templateId, recipientEmail, recipientId, recipientName } = await req.json();

    if (!templateId || !recipientEmail || !recipientId) {
      return NextResponse.json(
        { error: 'Template ID, recipient email, and recipient ID are required' },
        { status: 400 }
      );
    }

    // Find the template
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.active) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // Check if user meets requirements (in a real app, you'd check the database)
    const meetsRequirements = await checkRequirements(templateId, recipientId);
    if (!meetsRequirements) {
      return NextResponse.json(
        { error: 'User does not meet certificate requirements' },
        { status: 400 }
      );
    }

    // Generate certificate ID
    const certificateId = `cert_${Date.now()}`;
    const tokenId = `${1000 + mockCertificates.length + 1}`;

    // Generate blockchain hash (in a real app, this would be generated by the smart contract)
    const blockchainHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Create new certificate
    const newCertificate: Certificate = {
      id: certificateId,
      title: template.name,
      description: template.description,
      issuer: template.issuer,
      recipient: recipientName || recipientId,
      recipientEmail,
      subject: template.attributes.find(attr => attr.trait_type === 'Subject')?.value as string || 'Unknown',
      level: template.attributes.find(attr => attr.trait_type === 'Level')?.value as any || 'beginner',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      blockchainHash,
      transactionHash,
      blockNumber: 12345678 + mockCertificates.length,
      network: template.network,
      tokenId,
      metadata: {
        image: template.image,
        attributes: template.attributes,
        description: template.description,
        external_url: `https://hubedu.ia/certificates/${certificateId}`,
        background_color: '000000',
      },
      verification: {
        verified: true,
        verificationDate: new Date().toISOString(),
        verifier: 'HubEdu.ia Smart Contract',
        verificationMethod: 'smart_contract',
        proof: `0xproof${Math.random().toString(16).substr(2, 64)}`,
      },
      status: 'active',
    };

    // Add to mock database
    mockCertificates.push(newCertificate);

    // Create issuance record
    const issuance: CertificateIssuance = {
      id: `issuance_${Date.now()}`,
      templateId,
      recipientId,
      recipientEmail,
      status: 'issued',
      transactionHash,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    mockIssuances.push(issuance);

    return NextResponse.json({ certificate: newCertificate }, { status: 201 });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}

// Check if user meets certificate requirements
async function checkRequirements(templateId: string, recipientId: string): Promise<boolean> {
  // In a real application, this would check the user's progress against the template requirements
  // For now, we'll simulate that the user meets all requirements
  return true;
}