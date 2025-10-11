// Utilitários para gerenciamento de usuários e roles

export type UserRole = 'FREE' | 'PREMIUM' | 'ADMIN'

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  birth_date: string | null
  city: string | null
  state: string | null
  school: string | null
}

/**
 * Verifica se um usuário tem role premium
 */
export function isPremiumUser(role: UserRole | undefined): boolean {
  return role === 'PREMIUM'
}

/**
 * Verifica se um usuário tem role free
 */
export function isFreeUser(role: UserRole | undefined): boolean {
  return !role || role === 'FREE'
}

/**
 * Verifica se um usuário é admin
 */
export function isAdminUser(role: UserRole | undefined): boolean {
  return role === 'ADMIN'
}

/**
 * Verifica se o perfil do usuário está completo
 */
export function isProfileComplete(user: Partial<UserProfile>): boolean {
  return !!(
    user.birth_date &&
    user.city &&
    user.state &&
    user.school
  )
}

/**
 * Verifica se um usuário pode acessar uma funcionalidade baseada na role
 */
export function canAccessFeature(
  userRole: UserRole | undefined,
  requiredRole: 'FREE' | 'PREMIUM' | 'ADMIN' = 'PREMIUM'
): boolean {
  if (requiredRole === 'FREE') {
    return true // Qualquer usuário pode acessar funcionalidades free
  }

  if (requiredRole === 'PREMIUM') {
    return isPremiumUser(userRole) || isAdminUser(userRole)
  }

  if (requiredRole === 'ADMIN') {
    return isAdminUser(userRole)
  }

  return false
}

/**
 * Obtém a descrição da role do usuário
 */
export function getRoleDescription(role: UserRole | undefined): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador'
    case 'PREMIUM':
      return 'Premium'
    case 'FREE':
    default:
      return 'Gratuito'
  }
}

/**
 * Obtém as funcionalidades disponíveis para uma role
 */
export function getRoleFeatures(role: UserRole | undefined): string[] {
  const baseFeatures = [
    'Simulador ENEM completo',
    'Correção automática de redações'
  ]

  if (isPremiumUser(role) || isAdminUser(role)) {
    return [
      ...baseFeatures,
      'Aulas completas geradas por IA',
      'Chat Professor IA ilimitado',
      'Relatórios avançados',
      'Suporte prioritário'
    ]
  }

  return baseFeatures
}

/**
 * Calcula o preço baseado no número de usuários (para B2B)
 */
export function calculateBulkPrice(userCount: number, basePrice: number = 10): number {
  let discount = 0

  if (userCount >= 1000) discount = 0.25
  else if (userCount >= 500) discount = 0.20
  else if (userCount >= 200) discount = 0.15
  else if (userCount >= 100) discount = 0.10

  return Math.round(basePrice * (1 - discount) * 100) / 100
}
