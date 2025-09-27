export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  radius?: number;
  color: string;
  restitution: number; // coeficiente de restituição
  friction: number;
}

export interface PhysicsWorld {
  gravity: Vector2D;
  objects: PhysicsObject[];
  boundaries: {
    width: number;
    height: number;
  };
  timeStep: number;
  iterations: number;
}

export interface PendulumState {
  angle: number;
  angularVelocity: number;
  angularAcceleration: number;
  length: number;
  mass: number;
  gravity: number;
  damping: number;
}

export interface BouncingBallState {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  mass: number;
  restitution: number;
  gravity: number;
  airResistance: number;
}

export interface PhysicsSimulation {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  timeStep: number;
  world: PhysicsWorld;
  objects: PhysicsObject[];
  events: PhysicsEvent[];
}

export interface PhysicsEvent {
  type: 'collision' | 'boundary' | 'custom';
  timestamp: number;
  objectId: string;
  data: any;
}

export interface PhysicsParameters {
  gravity: number;
  timeStep: number;
  iterations: number;
  damping: number;
  airResistance: number;
  boundaryType: 'bounce' | 'wrap' | 'stop';
}

export interface Measurement {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  objectId?: string;
}

export interface PhysicsGraph {
  type: 'position' | 'velocity' | 'acceleration' | 'energy';
  data: {
    time: number;
    value: number;
    objectId?: string;
  }[];
  color: string;
  label: string;
}
