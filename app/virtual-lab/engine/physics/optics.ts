// engine/physics/optics.ts - Óptica geométrica e traçado de raios
import { OpticalRay, OpticalElement, RayTraceResult } from '../../types/physics';
import { DeterministicRNG } from '../core/rng';

export class OpticsEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Traça um raio através de elementos ópticos
   */
  traceRay(
    ray: OpticalRay,
    elements: OpticalElement[],
    maxIntersections: number = 10
  ): RayTraceResult {
    const intersections: RayTraceResult['intersections'] = [];
    let currentRay = { ...ray };
    let currentIntensity = ray.intensity;

    for (let i = 0; i < maxIntersections; i++) {
      const intersection = this.findNextIntersection(currentRay, elements);
      
      if (!intersection) {
        break; // Raio não intersecta mais nenhum elemento
      }

      intersections.push(intersection);
      
      // Atualizar raio para próxima iteração
      currentRay = {
        ...currentRay,
        start: intersection.point,
        direction: intersection.angle_refracted ? 
          this.calculateRefractedDirection(currentRay.direction, intersection) :
          this.calculateReflectedDirection(currentRay.direction, intersection),
        intensity: intersection.intensity_after
      };
      
      currentIntensity = intersection.intensity_after;
      
      if (currentIntensity < 0.01) {
        break; // Raio muito fraco para continuar
      }
    }

    return {
      ray_id: ray.id,
      intersections,
      final_direction: currentRay.direction,
      final_intensity: currentIntensity
    };
  }

  /**
   * Encontra a próxima interseção do raio com elementos ópticos
   */
  private findNextIntersection(
    ray: OpticalRay,
    elements: OpticalElement[]
  ): RayTraceResult['intersections'][0] | null {
    let closestIntersection: RayTraceResult['intersections'][0] | null = null;
    let closestDistance = Infinity;

    for (const element of elements) {
      const intersection = this.calculateIntersection(ray, element);
      
      if (intersection) {
        const distance = this.calculateDistance(ray.start, intersection.point);
        
        if (distance < closestDistance && distance > 0.001) { // Evitar auto-interseção
          closestDistance = distance;
          closestIntersection = intersection;
        }
      }
    }

    return closestIntersection;
  }

  /**
   * Calcula interseção entre raio e elemento óptico
   */
  private calculateIntersection(
    ray: OpticalRay,
    element: OpticalElement
  ): RayTraceResult['intersections'][0] | null {
    switch (element.type) {
      case 'lens':
        return this.calculateLensIntersection(ray, element);
      case 'mirror':
        return this.calculateMirrorIntersection(ray, element);
      case 'interface':
        return this.calculateInterfaceIntersection(ray, element);
      default:
        return null;
    }
  }

  /**
   * Calcula interseção com lente
   */
  private calculateLensIntersection(
    ray: OpticalRay,
    lens: OpticalElement
  ): RayTraceResult['intersections'][0] | null {
    const { position, orientation, properties } = lens;
    const focalLength = properties.focal_length || 100;
    
    // Simplificação: lente como linha vertical
    const lensX = position.x;
    const rayX = ray.start.x;
    const rayY = ray.start.y;
    const rayDirX = ray.direction.x;
    const rayDirY = ray.direction.y;
    
    // Verificar se raio cruza a lente
    if ((rayDirX > 0 && rayX >= lensX) || (rayDirX < 0 && rayX <= lensX)) {
      return null; // Raio não cruza a lente
    }
    
    // Calcular ponto de interseção
    const t = (lensX - rayX) / rayDirX;
    const intersectionY = rayY + t * rayDirY;
    
    // Verificar se interseção está dentro da abertura da lente
    const apertureRadius = (properties.aperture_diameter || 50) / 2;
    if (Math.abs(intersectionY - position.y) > apertureRadius) {
      return null;
    }
    
    // Calcular ângulos
    const incidentAngle = Math.atan2(rayDirY, rayDirX);
    const refractedAngle = this.calculateLensRefraction(incidentAngle, focalLength, intersectionY - position.y);
    
    // Calcular intensidade após refração
    const intensityAfter = ray.intensity * this.calculateTransmissionCoefficient(incidentAngle, refractedAngle);
    
    return {
      element_id: lens.id,
      point: { x: lensX, y: intersectionY },
      angle_incident: incidentAngle,
      angle_refracted: refractedAngle,
      intensity_after: this.rng.measurementNoise(intensityAfter, 0.01)
    };
  }

  /**
   * Calcula refração em lente
   */
  private calculateLensRefraction(
    incidentAngle: number,
    focalLength: number,
    heightFromCenter: number
  ): number {
    // Simplificação: usar equação de lente fina
    const deflection = heightFromCenter / focalLength;
    return incidentAngle + deflection;
  }

  /**
   * Calcula interseção com espelho
   */
  private calculateMirrorIntersection(
    ray: OpticalRay,
    mirror: OpticalElement
  ): RayTraceResult['intersections'][0] | null {
    const { position, orientation, properties } = mirror;
    
    // Simplificação: espelho como linha
    const mirrorX = position.x;
    const rayX = ray.start.x;
    const rayY = ray.start.y;
    const rayDirX = ray.direction.x;
    const rayDirY = ray.direction.y;
    
    // Verificar se raio cruza o espelho
    if ((rayDirX > 0 && rayX >= mirrorX) || (rayDirX < 0 && rayX <= mirrorX)) {
      return null;
    }
    
    // Calcular ponto de interseção
    const t = (mirrorX - rayX) / rayDirX;
    const intersectionY = rayY + t * rayDirY;
    
    // Calcular ângulos
    const incidentAngle = Math.atan2(rayDirY, rayDirX);
    const reflectedAngle = this.calculateMirrorReflection(incidentAngle, orientation);
    
    // Calcular intensidade após reflexão
    const intensityAfter = ray.intensity * this.calculateReflectionCoefficient(incidentAngle);
    
    return {
      element_id: mirror.id,
      point: { x: mirrorX, y: intersectionY },
      angle_incident: incidentAngle,
      angle_reflected: reflectedAngle,
      intensity_after: this.rng.measurementNoise(intensityAfter, 0.01)
    };
  }

  /**
   * Calcula reflexão em espelho
   */
  private calculateMirrorReflection(
    incidentAngle: number,
    mirrorOrientation: number
  ): number {
    // Lei da reflexão: ângulo de incidência = ângulo de reflexão
    return -incidentAngle + 2 * mirrorOrientation;
  }

  /**
   * Calcula interseção com interface
   */
  private calculateInterfaceIntersection(
    ray: OpticalRay,
    interfaceElement: OpticalElement
  ): RayTraceResult['intersections'][0] | null {
    // Implementação simplificada para interface entre meios
    const { position, properties } = interfaceElement;
    const refractiveIndex1 = 1.0; // Ar
    const refractiveIndex2 = properties.refractive_index || 1.5; // Vidro
    
    // Calcular interseção e refração usando Lei de Snell
    const incidentAngle = Math.atan2(ray.direction.y, ray.direction.x);
    const refractedAngle = this.calculateSnellRefraction(incidentAngle, refractiveIndex1, refractiveIndex2);
    
    if (refractedAngle === null) {
      return null; // Reflexão total interna
    }
    
    return {
      element_id: interfaceElement.id,
      point: { x: position.x, y: position.y },
      angle_incident: incidentAngle,
      angle_refracted: refractedAngle,
      intensity_after: this.rng.measurementNoise(ray.intensity * 0.95, 0.01)
    };
  }

  /**
   * Calcula refração usando Lei de Snell
   */
  private calculateSnellRefraction(
    incidentAngle: number,
    n1: number,
    n2: number
  ): number | null {
    const sinTheta2 = (n1 / n2) * Math.sin(incidentAngle);
    
    if (Math.abs(sinTheta2) > 1) {
      return null; // Reflexão total interna
    }
    
    return Math.asin(sinTheta2);
  }

  /**
   * Calcula direção refratada
   */
  private calculateRefractedDirection(
    incidentDirection: { x: number; y: number },
    intersection: RayTraceResult['intersections'][0]
  ): { x: number; y: number } {
    if (intersection.angle_refracted === undefined) {
      return incidentDirection;
    }
    
    return {
      x: Math.cos(intersection.angle_refracted),
      y: Math.sin(intersection.angle_refracted)
    };
  }

  /**
   * Calcula direção refletida
   */
  private calculateReflectedDirection(
    incidentDirection: { x: number; y: number },
    intersection: RayTraceResult['intersections'][0]
  ): { x: number; y: number } {
    if (intersection.angle_reflected === undefined) {
      return incidentDirection;
    }
    
    return {
      x: Math.cos(intersection.angle_reflected),
      y: Math.sin(intersection.angle_reflected)
    };
  }

  /**
   * Calcula coeficiente de transmissão
   */
  private calculateTransmissionCoefficient(
    incidentAngle: number,
    refractedAngle: number
  ): number {
    // Simplificação: assumir transmissão de 95%
    return 0.95;
  }

  /**
   * Calcula coeficiente de reflexão
   */
  private calculateReflectionCoefficient(incidentAngle: number): number {
    // Simplificação: assumir reflexão de 90%
    return 0.90;
  }

  /**
   * Calcula distância entre dois pontos
   */
  private calculateDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Simula formação de imagem em lente
   */
  simulateImageFormation(
    objectPosition: { x: number; y: number },
    lens: OpticalElement,
    objectHeight: number
  ): {
    imagePosition: { x: number; y: number };
    imageHeight: number;
    magnification: number;
    imageType: 'real' | 'virtual' | 'no_image';
  } {
    const { position, properties } = lens;
    const focalLength = properties.focal_length || 100;
    
    const objectDistance = Math.abs(objectPosition.x - position.x);
    const imageDistance = 1 / (1 / focalLength - 1 / objectDistance);
    
    let imagePosition: { x: number; y: number };
    let imageType: 'real' | 'virtual' | 'no_image';
    
    if (objectDistance < focalLength) {
      // Objeto dentro da distância focal - imagem virtual
      imagePosition = {
        x: position.x - Math.abs(imageDistance),
        y: objectPosition.y
      };
      imageType = 'virtual';
    } else if (objectDistance === focalLength) {
      // Objeto na distância focal - sem imagem
      imagePosition = { x: Infinity, y: 0 };
      imageType = 'no_image';
    } else {
      // Objeto além da distância focal - imagem real
      imagePosition = {
        x: position.x + imageDistance,
        y: objectPosition.y
      };
      imageType = 'real';
    }
    
    const magnification = -imageDistance / objectDistance;
    const imageHeight = objectHeight * Math.abs(magnification);
    
    return {
      imagePosition: imageType === 'no_image' ? { x: 0, y: 0 } : imagePosition,
      imageHeight: this.rng.measurementNoise(imageHeight, 0.01),
      magnification: this.rng.measurementNoise(magnification, 0.01),
      imageType
    };
  }

  /**
   * Calcula dispersão da luz (efeito prismático)
   */
  calculateDispersion(
    wavelength: number,
    refractiveIndex: number = 1.5
  ): number {
    // Simplificação: dispersão linear com comprimento de onda
    const baseRefractiveIndex = 1.5;
    const dispersionCoefficient = 0.01;
    
    return baseRefractiveIndex + dispersionCoefficient * (wavelength - 550); // 550nm como referência
  }

  /**
   * Simula interferência de fenda dupla
   */
  simulateDoubleSlitInterference(
    wavelength: number,
    slitSeparation: number,
    screenDistance: number,
    screenWidth: number
  ): Array<{ position: number; intensity: number }> {
    const interferencePattern: Array<{ position: number; intensity: number }> = [];
    const numPoints = 100;
    
    for (let i = 0; i < numPoints; i++) {
      const y = (i / numPoints - 0.5) * screenWidth;
      const pathDifference = (slitSeparation * y) / screenDistance;
      const phaseDifference = (2 * Math.PI * pathDifference) / wavelength;
      const intensity = Math.cos(phaseDifference / 2) ** 2;
      
      interferencePattern.push({
        position: y,
        intensity: this.rng.measurementNoise(intensity, 0.01)
      });
    }
    
    return interferencePattern;
  }
}
