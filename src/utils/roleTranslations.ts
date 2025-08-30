/**
 * Función para traducir nombres de roles a nombres más amigables
 */
export const getRoleDisplayName = (roleName: string): string => {
  if (!roleName) return '';
  
  // Mapear nombres de roles a nombres más amigables
  switch (roleName.toLowerCase()) {
    case 'familyadmin':
      return 'Tutor';
    case 'coordinador':
      return 'Coordinador';
    case 'adminaccount':
      return 'Administrador';
    case 'familyviewer':
      return 'Visualizador';
    case 'superadmin':
      return 'Super Administrador';
    default:
      return roleName;
  }
};
