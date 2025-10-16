import { NextRequest, NextResponse } from 'next/server';
import { CertificateTemplate } from '@/hooks/useBlockchainCertificates';

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
  {
    id: 'template_003',
    name: 'Certificado de Conclusão - Português Avançado',
    description: 'Template para certificado de conclusão do curso de Português Avançado',
    image: '/certificates/templates/portuguese_advanced_template.png',
    attributes: [
      { trait_type: 'Subject', value: 'Português' },
      { trait_type: 'Level', value: 'Avançado' },
      { trait_type: 'Issuer', value: 'HubEdu.ia' },
      { trait_type: 'Network', value: 'Polygon' },
      { trait_type: 'Rarity', value: 'Rare' },
    ],
    requirements: [
      {
        id: 'req_005',
        type: 'course_completion',
        description: 'Completar 100% do curso de Português Avançado',
        threshold: 100,
        required: true,
      },
      {
        id: 'req_006',
        type: 'quiz_score',
        description: 'Obter pelo menos 85% de acerto nos quizzes',
        threshold: 85,
        required: true,
      },
      {
        id: 'req_007',
        type: 'essay_submission',
        description: 'Submeter redação com nota mínima de 8.0',
        threshold: 8.0,
        required: true,
      },
    ],
    issuer: 'HubEdu.ia',
    network: 'polygon',
    contractAddress: '0x1234567890123456789012345678901234567890',
    price: 0.02, // 0.02 ETH
    active: true,
  },
  {
    id: 'template_004',
    name: 'Certificado de Conclusão - Química Orgânica',
    description: 'Template para certificado de conclusão do curso de Química Orgânica',
    image: '/certificates/templates/organic_chemistry_template.png',
    attributes: [
      { trait_type: 'Subject', value: 'Química' },
      { trait_type: 'Level', value: 'Avançado' },
      { trait_type: 'Issuer', value: 'HubEdu.ia' },
      { trait_type: 'Network', value: 'Polygon' },
      { trait_type: 'Rarity', value: 'Epic' },
    ],
    requirements: [
      {
        id: 'req_008',
        type: 'course_completion',
        description: 'Completar 100% do curso de Química Orgânica',
        threshold: 100,
        required: true,
      },
      {
        id: 'req_009',
        type: 'lab_experiment',
        description: 'Completar 5 experimentos de laboratório',
        threshold: 5,
        required: true,
      },
      {
        id: 'req_010',
        type: 'final_exam',
        description: 'Obter nota mínima de 9.0 no exame final',
        threshold: 9.0,
        required: true,
      },
    ],
    issuer: 'HubEdu.ia',
    network: 'polygon',
    contractAddress: '0x1234567890123456789012345678901234567890',
    price: 0.05, // 0.05 ETH
    active: true,
  },
];

// Get all certificate templates
export async function GET(req: NextRequest) {
  try {
    const active = req.nextUrl.searchParams.get('active');
    const network = req.nextUrl.searchParams.get('network');
    const subject = req.nextUrl.searchParams.get('subject');

    let filteredTemplates = mockTemplates;

    if (active === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.active);
    }

    if (network) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.network.toLowerCase() === network.toLowerCase()
      );
    }

    if (subject) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.attributes.some(attr => 
          attr.trait_type === 'Subject' && 
          attr.value.toLowerCase().includes(subject.toLowerCase())
        )
      );
    }

    return NextResponse.json({ templates: filteredTemplates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching certificate templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate templates' },
      { status: 500 }
    );
  }
}

// Create a new certificate template
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      image,
      attributes,
      requirements,
      issuer,
      network,
      contractAddress,
      price,
    } = await req.json();

    if (!name || !description || !issuer || !network || !contractAddress) {
      return NextResponse.json(
        { error: 'Name, description, issuer, network, and contract address are required' },
        { status: 400 }
      );
    }

    // Generate template ID
    const templateId = `template_${Date.now()}`;

    // Create new template
    const newTemplate: CertificateTemplate = {
      id: templateId,
      name,
      description,
      image: image || '/certificates/templates/default_template.png',
      attributes: attributes || [],
      requirements: requirements || [],
      issuer,
      network,
      contractAddress,
      price: price || 0.01,
      active: true,
    };

    // Add to mock database
    mockTemplates.push(newTemplate);

    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error('Error creating certificate template:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate template' },
      { status: 500 }
    );
  }
}

// Update a certificate template
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = mockTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template
    mockTemplates[templateIndex] = {
      ...mockTemplates[templateIndex],
      ...updates,
    };

    return NextResponse.json({ template: mockTemplates[templateIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating certificate template:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate template' },
      { status: 500 }
    );
  }
}

// Delete a certificate template
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = mockTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Remove template
    mockTemplates.splice(templateIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting certificate template:', error);
    return NextResponse.json(
      { error: 'Failed to delete certificate template' },
      { status: 500 }
    );
  }
}
