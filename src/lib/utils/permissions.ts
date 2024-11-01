// src/lib/utils/permissions.ts
import { ROLES, ROLE_FEATURES } from '@/lib/constants'

export function checkPermission(userRole: keyof typeof ROLES, feature: string): boolean {
  // If user is admin, they have access to everything
  if (userRole === ROLES.ADMIN) return true

  // Check in base features
  if (feature in ROLE_FEATURES[userRole]) {
    return ROLE_FEATURES[userRole][feature]
  }

  // Check in premium features
  if (ROLE_FEATURES[userRole].premiumFeatures && 
      feature in ROLE_FEATURES[userRole].premiumFeatures) {
    return ROLE_FEATURES[userRole].premiumFeatures[feature]
  }

  // Check in admin features (for future-proofing)
  if (ROLE_FEATURES[userRole].adminFeatures && 
      feature in ROLE_FEATURES[userRole].adminFeatures) {
    return ROLE_FEATURES[userRole].adminFeatures[feature]
  }

  return false
}

// Helper to check multiple permissions at once
export function checkPermissions(userRole: keyof typeof ROLES, features: string[]): boolean {
  return features.every(feature => checkPermission(userRole, feature))
}

// Helper to get all available permissions for a role
export function getRolePermissions(userRole: keyof typeof ROLES): string[] {
  const permissions = []
  const roleFeatures = ROLE_FEATURES[userRole]

  // Add base features
  Object.entries(roleFeatures).forEach(([key, value]) => {
    if (typeof value === 'boolean' && value) {
      permissions.push(key)
    }
  })

  // Add premium features
  if (roleFeatures.premiumFeatures) {
    Object.entries(roleFeatures.premiumFeatures).forEach(([key, value]) => {
      if (value) {
        permissions.push(key)
      }
    })
  }

  // Add admin features
  if (roleFeatures.adminFeatures) {
    Object.entries(roleFeatures.adminFeatures).forEach(([key, value]) => {
      if (value) {
        permissions.push(key)
      }
    })
  }

  return permissions
}
