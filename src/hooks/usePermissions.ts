// src/hooks/usePermissions.ts
import { useAuth } from '@/providers/auth-provider'
import { checkPermission, checkPermissions, getRolePermissions } from '@/lib/utils/permissions'

export function usePermissions() {
  const { user } = useAuth()

  if (!user) {
    return {
      can: () => false,
      canAll: () => false,
      permissions: [],
      isLoading: false
    }
  }

  return {
    can: (feature: string) => checkPermission(user.role as any, feature),
    canAll: (features: string[]) => checkPermissions(user.role as any, features),
    permissions: getRolePermissions(user.role as any),
    isLoading: false
  }
}
