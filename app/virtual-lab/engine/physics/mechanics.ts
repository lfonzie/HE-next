// engine/physics/mechanics.ts - Mecânica 2D e colisões
import { MechanicalObject, Spring, Collision, MotionAnalysis } from '../../types/physics';
import { DeterministicRNG } from '../core/rng';

export class MechanicsEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Atualiza a posição de um objeto usando integração de Verlet
   */
  updateObjectPosition(
    object: MechanicalObject,
    forces: Array<{ x: number; y: number }>,
    timestep: number
  ): MechanicalObject {
    // Calcular aceleração total
    let totalForceX = 0;
    let totalForceY = 0;

    for (const force of forces) {
      totalForceX += force.x;
      totalForceY += force.y;
    }

    // F = ma, então a = F/m
    const accelerationX = totalForceX / object.mass;
    const accelerationY = totalForceY / object.mass;

    // Integração de Verlet para posição
    const newPosition = {
      x: object.position.x + object.velocity.x * timestep + 0.5 * accelerationX * timestep * timestep,
      y: object.position.y + object.velocity.y * timestep + 0.5 * accelerationY * timestep * timestep
    };

    // Atualizar velocidade
    const newVelocity = {
      x: object.velocity.x + accelerationX * timestep,
      y: object.velocity.y + accelerationY * timestep
    };

    return {
      ...object,
      position: newPosition,
      velocity: newVelocity,
      acceleration: { x: accelerationX, y: accelerationY }
    };
  }

  /**
   * Calcula força gravitacional
   */
  static calculateGravitationalForce(
    mass: number,
    gravity: number = 9.81
  ): { x: number; y: number } {
    return { x: 0, y: mass * gravity };
  }

  /**
   * Calcula força de atrito
   */
  static calculateFrictionForce(
    velocity: { x: number; y: number },
    normalForce: number,
    frictionCoefficient: number
  ): { x: number; y: number } {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (speed === 0) return { x: 0, y: 0 };

    const frictionMagnitude = frictionCoefficient * normalForce;
    const frictionX = -(velocity.x / speed) * frictionMagnitude;
    const frictionY = -(velocity.y / speed) * frictionMagnitude;

    return { x: frictionX, y: frictionY };
  }

  /**
   * Calcula força de uma mola (Lei de Hooke)
   */
  static calculateSpringForce(
    spring: Spring,
    objectPosition: { x: number; y: number },
    anchorPosition: { x: number; y: number }
  ): { x: number; y: number } {
    const dx = objectPosition.x - anchorPosition.x;
    const dy = objectPosition.y - anchorPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const displacement = distance - spring.length_rest;
    const forceMagnitude = -spring.k * displacement;
    
    if (distance === 0) return { x: 0, y: 0 };
    
    const forceX = (dx / distance) * forceMagnitude;
    const forceY = (dy / distance) * forceMagnitude;
    
    return { x: forceX, y: forceY };
  }

  /**
   * Simula colisão elástica entre dois objetos
   */
  simulateElasticCollision(
    object1: MechanicalObject,
    object2: MechanicalObject,
    coefficientOfRestitution: number = 1.0
  ): Collision {
    // Calcular velocidades relativas
    const relativeVelocityX = object1.velocity.x - object2.velocity.x;
    const relativeVelocityY = object1.velocity.y - object2.velocity.y;
    
    // Calcular posições relativas
    const relativePositionX = object2.position.x - object1.position.x;
    const relativePositionY = object2.position.y - object1.position.y;
    
    const distance = Math.sqrt(relativePositionX * relativePositionX + relativePositionY * relativePositionY);
    
    if (distance === 0) {
      // Objetos sobrepostos - separar
      const separationX = this.rng.range(-0.1, 0.1);
      const separationY = this.rng.range(-0.1, 0.1);
      
      return {
        object1: object1.id,
        object2: object2.id,
        point: { x: (object1.position.x + object2.position.x) / 2, y: (object1.position.y + object2.position.y) / 2 },
        velocity_before: { v1: object1.velocity, v2: object2.velocity },
        velocity_after: { v1: { x: object1.velocity.x + separationX, y: object1.velocity.y + separationY }, v2: { x: object2.velocity.x - separationX, y: object2.velocity.y - separationY } },
        coefficient_restitution: coefficientOfRestitution,
        momentum_conserved: true
      };
    }
    
    // Calcular impulso
    const impulse = (2 * (relativeVelocityX * relativePositionX + relativeVelocityY * relativePositionY)) / 
                   (distance * distance * (1/object1.mass + 1/object2.mass)) * coefficientOfRestitution;
    
    // Calcular novas velocidades
    const newVelocity1X = object1.velocity.x + (impulse * relativePositionX) / object1.mass;
    const newVelocity1Y = object1.velocity.y + (impulse * relativePositionY) / object1.mass;
    const newVelocity2X = object2.velocity.x - (impulse * relativePositionX) / object2.mass;
    const newVelocity2Y = object2.velocity.y - (impulse * relativePositionY) / object2.mass;
    
    return {
      object1: object1.id,
      object2: object2.id,
      point: { x: (object1.position.x + object2.position.x) / 2, y: (object1.position.y + object2.position.y) / 2 },
      velocity_before: { v1: object1.velocity, v2: object2.velocity },
      velocity_after: { 
        v1: { x: this.rng.measurementNoise(newVelocity1X, 0.01), y: this.rng.measurementNoise(newVelocity1Y, 0.01) },
        v2: { x: this.rng.measurementNoise(newVelocity2X, 0.01), y: this.rng.measurementNoise(newVelocity2Y, 0.01) }
      },
      coefficient_restitution: coefficientOfRestitution,
      momentum_conserved: this.verifyMomentumConservation(object1, object2, { v1: { x: newVelocity1X, y: newVelocity1Y }, v2: { x: newVelocity2X, y: newVelocity2Y } })
    };
  }

  /**
   * Verifica conservação do momento linear
   */
  private verifyMomentumConservation(
    object1: MechanicalObject,
    object2: MechanicalObject,
    velocitiesAfter: { v1: { x: number; y: number }; v2: { x: number; y: number } }
  ): boolean {
    const momentumBeforeX = object1.mass * object1.velocity.x + object2.mass * object2.velocity.x;
    const momentumBeforeY = object1.mass * object1.velocity.y + object2.mass * object2.velocity.y;
    
    const momentumAfterX = object1.mass * velocitiesAfter.v1.x + object2.mass * velocitiesAfter.v2.x;
    const momentumAfterY = object1.mass * velocitiesAfter.v1.y + object2.mass * velocitiesAfter.v2.y;
    
    const tolerance = 0.01;
    return Math.abs(momentumBeforeX - momentumAfterX) < tolerance && 
           Math.abs(momentumBeforeY - momentumAfterY) < tolerance;
  }

  /**
   * Simula movimento de projétil
   */
  simulateProjectileMotion(
    initialPosition: { x: number; y: number },
    initialVelocity: { x: number; y: number },
    gravity: number = 9.81,
    totalTime: number,
    timestep: number
  ): MotionAnalysis {
    const timePoints: number[] = [];
    const positions: Array<{ x: number; y: number }> = [];
    const velocities: Array<{ x: number; y: number }> = [];
    const accelerations: Array<{ x: number; y: number }> = [];
    const kineticEnergy: number[] = [];
    const potentialEnergy: number[] = [];
    const totalEnergy: number[] = [];

    let currentPosition = { ...initialPosition };
    let currentVelocity = { ...initialVelocity };
    const mass = 1; // kg (assumido)

    for (let time = 0; time <= totalTime; time += timestep) {
      // Atualizar posição
      currentPosition.x = initialPosition.x + initialVelocity.x * time;
      currentPosition.y = initialPosition.y + initialVelocity.y * time - 0.5 * gravity * time * time;
      
      // Atualizar velocidade
      currentVelocity.x = initialVelocity.x;
      currentVelocity.y = initialVelocity.y - gravity * time;
      
      // Calcular energias
      const ke = 0.5 * mass * (currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
      const pe = mass * gravity * currentPosition.y;
      const te = ke + pe;

      timePoints.push(time);
      positions.push({ ...currentPosition });
      velocities.push({ ...currentVelocity });
      accelerations.push({ x: 0, y: -gravity });
      kineticEnergy.push(this.rng.measurementNoise(ke, 0.01));
      potentialEnergy.push(this.rng.measurementNoise(pe, 0.01));
      totalEnergy.push(this.rng.measurementNoise(te, 0.01));
    }

    return {
      object_id: 'projectile',
      time_points: timePoints,
      positions,
      velocities,
      accelerations,
      kinetic_energy: kineticEnergy,
      potential_energy: potentialEnergy,
      total_energy: totalEnergy
    };
  }

  /**
   * Simula movimento harmônico simples (mola)
   */
  simulateSimpleHarmonicMotion(
    spring: Spring,
    mass: number,
    initialDisplacement: number,
    totalTime: number,
    timestep: number
  ): MotionAnalysis {
    const timePoints: number[] = [];
    const positions: Array<{ x: number; y: number }> = [];
    const velocities: Array<{ x: number; y: number }> = [];
    const accelerations: Array<{ x: number; y: number }> = [];
    const kineticEnergy: number[] = [];
    const potentialEnergy: number[] = [];
    const totalEnergy: number[] = [];

    const angularFrequency = Math.sqrt(spring.k / mass);
    const amplitude = initialDisplacement;

    for (let time = 0; time <= totalTime; time += timestep) {
      const displacement = amplitude * Math.cos(angularFrequency * time);
      const velocity = -amplitude * angularFrequency * Math.sin(angularFrequency * time);
      const acceleration = -amplitude * angularFrequency * angularFrequency * Math.cos(angularFrequency * time);

      const ke = 0.5 * mass * velocity * velocity;
      const pe = 0.5 * spring.k * displacement * displacement;
      const te = ke + pe;

      timePoints.push(time);
      positions.push({ x: displacement, y: 0 });
      velocities.push({ x: velocity, y: 0 });
      accelerations.push({ x: acceleration, y: 0 });
      kineticEnergy.push(this.rng.measurementNoise(ke, 0.01));
      potentialEnergy.push(this.rng.measurementNoise(pe, 0.01));
      totalEnergy.push(this.rng.measurementNoise(te, 0.01));
    }

    return {
      object_id: 'harmonic_oscillator',
      time_points: timePoints,
      positions,
      velocities,
      accelerations,
      kinetic_energy: kineticEnergy,
      potential_energy: potentialEnergy,
      total_energy: totalEnergy
    };
  }

  /**
   * Calcula energia cinética
   */
  static calculateKineticEnergy(mass: number, velocity: { x: number; y: number }): number {
    const speedSquared = velocity.x * velocity.x + velocity.y * velocity.y;
    return 0.5 * mass * speedSquared;
  }

  /**
   * Calcula energia potencial gravitacional
   */
  static calculatePotentialEnergy(mass: number, height: number, gravity: number = 9.81): number {
    return mass * gravity * height;
  }

  /**
   * Calcula energia potencial elástica
   */
  static calculateElasticPotentialEnergy(springConstant: number, displacement: number): number {
    return 0.5 * springConstant * displacement * displacement;
  }
}
