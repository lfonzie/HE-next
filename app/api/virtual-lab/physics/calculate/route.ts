import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experiment, parameters } = body;

    let result;

    switch (experiment) {
      case 'pendulum':
        // Calculate pendulum period: T = 2π√(L/g)
        const { length, gravity } = parameters;
        const period = 2 * Math.PI * Math.sqrt(length / gravity);
        const frequency = 1 / period;
        const angularFrequency = 2 * Math.PI * frequency;
        
        result = {
          period,
          frequency,
          angularFrequency,
          maxVelocity: Math.sqrt(2 * gravity * length * (1 - Math.cos(parameters.angle * Math.PI / 180))),
          maxAcceleration: gravity * Math.sin(parameters.angle * Math.PI / 180)
        };
        break;

      case 'bouncing-ball':
        // Calculate bouncing ball physics
        const { initialHeight, restitution, airResistance } = parameters;
        const maxHeight = initialHeight;
        const impactVelocity = Math.sqrt(2 * parameters.gravity * initialHeight);
        const bounceHeight = initialHeight * Math.pow(restitution, 2);
        const totalBounces = Math.floor(Math.log(0.01) / Math.log(restitution)); // Until 1% of original height
        
        result = {
          maxHeight,
          impactVelocity,
          bounceHeight,
          totalBounces,
          finalHeight: initialHeight * Math.pow(restitution, totalBounces),
          timeToStop: (2 * impactVelocity) / (parameters.gravity * (1 - restitution))
        };
        break;

      case 'color-mixing':
        // Calculate color mixing results
        const { red, green, blue } = parameters;
        const hex = `#${Math.round(red).toString(16).padStart(2, '0')}${Math.round(green).toString(16).padStart(2, '0')}${Math.round(blue).toString(16).padStart(2, '0')}`;
        
        // Convert to HSL
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        
        result = {
          rgb: { red, green, blue },
          hex,
          hsl: {
            hue: Math.round(h * 360),
            saturation: Math.round(s * 100),
            lightness: Math.round(l * 100)
          },
          brightness: Math.round((red * 299 + green * 587 + blue * 114) / 1000),
          contrast: l > 0.5 ? 'dark' : 'light'
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown experiment type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        experiment,
        parameters,
        result,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error calculating physics:', error);
    return NextResponse.json(
      { success: false, error: 'Calculation failed' },
      { status: 500 }
    );
  }
}
