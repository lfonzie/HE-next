import { NextRequest, NextResponse } from 'next/server';

// Mock chemical reactions data
const chemicalReactions = [
  {
    id: 'neutralization-1',
    name: 'Neutralização HCl + NaOH',
    reactants: [
      { compound: 'HCl', coefficient: 1, state: 'aqueous' },
      { compound: 'NaOH', coefficient: 1, state: 'aqueous' }
    ],
    products: [
      { compound: 'NaCl', coefficient: 1, state: 'aqueous' },
      { compound: 'H2O', coefficient: 1, state: 'liquid' }
    ],
    type: 'neutralization',
    enthalpy: -57.1, // kJ/mol
    description: 'Reação de neutralização entre ácido clorídrico e hidróxido de sódio'
  },
  {
    id: 'precipitation-1',
    name: 'Precipitação AgNO3 + NaCl',
    reactants: [
      { compound: 'AgNO3', coefficient: 1, state: 'aqueous' },
      { compound: 'NaCl', coefficient: 1, state: 'aqueous' }
    ],
    products: [
      { compound: 'AgCl', coefficient: 1, state: 'solid' },
      { compound: 'NaNO3', coefficient: 1, state: 'aqueous' }
    ],
    type: 'precipitation',
    enthalpy: -65.5, // kJ/mol
    description: 'Formação de precipitado branco de cloreto de prata'
  },
  {
    id: 'decomposition-1',
    name: 'Decomposição CaCO3',
    reactants: [
      { compound: 'CaCO3', coefficient: 1, state: 'solid' }
    ],
    products: [
      { compound: 'CaO', coefficient: 1, state: 'solid' },
      { compound: 'CO2', coefficient: 1, state: 'gas' }
    ],
    type: 'decomposition',
    enthalpy: 178.3, // kJ/mol
    description: 'Decomposição térmica do carbonato de cálcio'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const compound = searchParams.get('compound');

    let filteredReactions = chemicalReactions;

    if (type) {
      filteredReactions = filteredReactions.filter(reaction => reaction.type === type);
    }

    if (compound) {
      filteredReactions = filteredReactions.filter(reaction => 
        reaction.reactants.some(r => r.compound.toLowerCase().includes(compound.toLowerCase())) ||
        reaction.products.some(p => p.compound.toLowerCase().includes(compound.toLowerCase()))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredReactions,
      count: filteredReactions.length
    });
  } catch (error) {
    console.error('Error fetching chemical reactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chemical reactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reactants, conditions } = body;

    // Simulate reaction prediction
    const reaction = chemicalReactions.find(r => 
      r.reactants.every(reactant => 
        reactants.some((input: any) => input.compound === reactant.compound)
      )
    );

    if (reaction) {
      return NextResponse.json({
        success: true,
        data: {
          reaction,
          predicted: true,
          confidence: 0.95,
          conditions: {
            temperature: conditions?.temperature || 25,
            pressure: conditions?.pressure || 1,
            pH: conditions?.pH || 7
          }
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No reaction found for the given reactants',
        data: null
      });
    }
  } catch (error) {
    console.error('Error predicting reaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to predict reaction' },
      { status: 500 }
    );
  }
}
