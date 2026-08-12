export function hasPermission(userPermissions: string[] = [], requiredPermission: string): boolean {
  if (userPermissions.includes('*:*') || userPermissions.includes('*')) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[] = [], requiredPermissions: string[]): boolean {
  return requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}
