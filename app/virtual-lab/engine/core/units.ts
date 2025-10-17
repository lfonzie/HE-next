// engine/core/units.ts - Sistema de unidades e conversões
export interface Unit {
  name: string;
  symbol: string;
  baseUnit: string;
  conversionFactor: number;
  dimension: string;
}

export const UNITS = {
  // Volume
  LITER: { name: 'litro', symbol: 'L', baseUnit: 'm³', conversionFactor: 0.001, dimension: 'volume' },
  MILLILITER: { name: 'mililitro', symbol: 'mL', baseUnit: 'm³', conversionFactor: 0.000001, dimension: 'volume' },
  MICROLITER: { name: 'microlitro', symbol: 'μL', baseUnit: 'm³', conversionFactor: 0.000000001, dimension: 'volume' },

  // Mass
  GRAM: { name: 'grama', symbol: 'g', baseUnit: 'kg', conversionFactor: 0.001, dimension: 'mass' },
  MILLIGRAM: { name: 'miligrama', symbol: 'mg', baseUnit: 'kg', conversionFactor: 0.000001, dimension: 'mass' },
  KILOGRAM: { name: 'quilograma', symbol: 'kg', baseUnit: 'kg', conversionFactor: 1, dimension: 'mass' },

  // Concentration
  MOLAR: { name: 'molar', symbol: 'M', baseUnit: 'mol/L', conversionFactor: 1, dimension: 'concentration' },
  MILLIMOLAR: { name: 'milimolar', symbol: 'mM', baseUnit: 'mol/L', conversionFactor: 0.001, dimension: 'concentration' },
  MICROMOLAR: { name: 'micromolar', symbol: 'μM', baseUnit: 'mol/L', conversionFactor: 0.000001, dimension: 'concentration' },

  // Temperature
  CELSIUS: { name: 'Celsius', symbol: '°C', baseUnit: 'K', conversionFactor: 1, dimension: 'temperature' },
  KELVIN: { name: 'Kelvin', symbol: 'K', baseUnit: 'K', conversionFactor: 1, dimension: 'temperature' },
  FAHRENHEIT: { name: 'Fahrenheit', symbol: '°F', baseUnit: 'K', conversionFactor: 5/9, dimension: 'temperature' },

  // Pressure
  ATMOSPHERE: { name: 'atmosfera', symbol: 'atm', baseUnit: 'Pa', conversionFactor: 101325, dimension: 'pressure' },
  PASCAL: { name: 'pascal', symbol: 'Pa', baseUnit: 'Pa', conversionFactor: 1, dimension: 'pressure' },
  TORR: { name: 'torr', symbol: 'Torr', baseUnit: 'Pa', conversionFactor: 133.322, dimension: 'pressure' },

  // Energy
  JOULE: { name: 'joule', symbol: 'J', baseUnit: 'J', conversionFactor: 1, dimension: 'energy' },
  CALORIE: { name: 'caloria', symbol: 'cal', baseUnit: 'J', conversionFactor: 4.184, dimension: 'energy' },
  KILOCALORIE: { name: 'quilocaloria', symbol: 'kcal', baseUnit: 'J', conversionFactor: 4184, dimension: 'energy' },

  // Electrical
  VOLT: { name: 'volt', symbol: 'V', baseUnit: 'V', conversionFactor: 1, dimension: 'voltage' },
  AMPERE: { name: 'ampère', symbol: 'A', baseUnit: 'A', conversionFactor: 1, dimension: 'current' },
  OHM: { name: 'ohm', symbol: 'Ω', baseUnit: 'Ω', conversionFactor: 1, dimension: 'resistance' },
  WATT: { name: 'watt', symbol: 'W', baseUnit: 'W', conversionFactor: 1, dimension: 'power' },

  // Length
  METER: { name: 'metro', symbol: 'm', baseUnit: 'm', conversionFactor: 1, dimension: 'length' },
  CENTIMETER: { name: 'centímetro', symbol: 'cm', baseUnit: 'm', conversionFactor: 0.01, dimension: 'length' },
  MILLIMETER: { name: 'milímetro', symbol: 'mm', baseUnit: 'm', conversionFactor: 0.001, dimension: 'length' },

  // Time
  SECOND: { name: 'segundo', symbol: 's', baseUnit: 's', conversionFactor: 1, dimension: 'time' },
  MINUTE: { name: 'minuto', symbol: 'min', baseUnit: 's', conversionFactor: 60, dimension: 'time' },
  HOUR: { name: 'hora', symbol: 'h', baseUnit: 's', conversionFactor: 3600, dimension: 'time' },
} as const;

export class UnitConverter {
  static convert(value: number, fromUnit: Unit, toUnit: Unit): number {
    if (fromUnit.dimension !== toUnit.dimension) {
      throw new Error(`Cannot convert between different dimensions: ${fromUnit.dimension} and ${toUnit.dimension}`);
    }
    
    // Convert to base unit first, then to target unit
    const baseValue = value * fromUnit.conversionFactor;
    return baseValue / toUnit.conversionFactor;
  }

  static celsiusToKelvin(celsius: number): number {
    return celsius + 273.15;
  }

  static kelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
  }

  static celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  static fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5/9;
  }

  static formatValue(value: number, unit: Unit, precision: number = 3): string {
    const formatted = value.toFixed(precision);
    return `${formatted} ${unit.symbol}`;
  }

  static formatScientific(value: number, precision: number = 2): string {
    return value.toExponential(precision);
  }
}

// Constantes físicas importantes
export const PHYSICAL_CONSTANTS = {
  AVOGADRO: 6.022e23,           // mol⁻¹
  GAS_CONSTANT: 8.314,          // J/(mol·K)
  FARADAY: 96485,               // C/mol
  SPEED_OF_LIGHT: 2.998e8,      // m/s
  PLANCK: 6.626e-34,            // J·s
  BOLTZMANN: 1.381e-23,         // J/K
  WATER_DENSITY: 1000,          // kg/m³
  WATER_SPECIFIC_HEAT: 4184,    // J/(kg·K)
  ATMOSPHERIC_PRESSURE: 101325,  // Pa
} as const;
