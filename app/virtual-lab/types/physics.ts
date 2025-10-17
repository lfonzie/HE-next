// types/physics.ts - Tipos específicos de física
export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  voltage?: number;
}

export interface CircuitElement {
  id: string;
  type: 'resistor' | 'voltageSource' | 'currentSource' | 'capacitor' | 'inductor' | 'lamp' | 'switch';
  n1: string;  // node 1
  n2: string;  // node 2
  value: number;
  unit: string;
  properties?: Record<string, any>;
}

export interface Circuit {
  nodes: CircuitNode[];
  elements: CircuitElement[];
  ground_node?: string;
}

export interface CircuitAnalysis {
  node_voltages: Record<string, number>;
  element_currents: Record<string, number>;
  power_dissipated: Record<string, number>;
  total_power: number;
}

export interface MechanicalObject {
  id: string;
  type: 'cart' | 'mass' | 'spring' | 'block' | 'pendulum';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  mass: number;
  properties: Record<string, any>;
}

export interface Spring {
  id: string;
  k: number;        // constante da mola (N/m)
  length_rest: number; // comprimento em repouso (m)
  length_current: number;
  force: number;     // força atual (N)
}

export interface Collision {
  object1: string;
  object2: string;
  point: { x: number; y: number };
  velocity_before: { v1: { x: number; y: number }; v2: { x: number; y: number } };
  velocity_after: { v1: { x: number; y: number }; v2: { x: number; y: number } };
  coefficient_restitution: number;
  momentum_conserved: boolean;
}

export interface OpticalRay {
  id: string;
  start: { x: number; y: number };
  direction: { x: number; y: number };
  wavelength: number;
  intensity: number;
  color: string;
}

export interface OpticalElement {
  id: string;
  type: 'lens' | 'mirror' | 'prism' | 'interface';
  position: { x: number; y: number };
  orientation: number; // ângulo em radianos
  properties: {
    focal_length?: number;
    refractive_index?: number;
    curvature_radius?: number;
    aperture_diameter?: number;
  };
}

export interface RayTraceResult {
  ray_id: string;
  intersections: Array<{
    element_id: string;
    point: { x: number; y: number };
    angle_incident: number;
    angle_refracted?: number;
    angle_reflected?: number;
    intensity_after: number;
  }>;
  final_direction: { x: number; y: number };
  final_intensity: number;
}

export interface MotionAnalysis {
  object_id: string;
  time_points: number[];
  positions: Array<{ x: number; y: number }>;
  velocities: Array<{ x: number; y: number }>;
  accelerations: Array<{ x: number; y: number }>;
  kinetic_energy: number[];
  potential_energy: number[];
  total_energy: number[];
}

export interface ElectricalMeasurement {
  instrument_id: string;
  measurement_type: 'voltage' | 'current' | 'resistance' | 'power';
  value: number;
  unit: string;
  timestamp: number;
  accuracy?: number;
}

export interface PhysicsConstants {
  gravity: number;        // m/s²
  air_resistance: number; // coeficiente de resistência do ar
  friction_static: number; // coeficiente de atrito estático
  friction_kinetic: number; // coeficiente de atrito cinético
  speed_of_light: number;  // m/s
  refractive_index_air: number;
}
