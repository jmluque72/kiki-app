import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';

interface AuthSyncProps {
  children: React.ReactNode;
}

const AuthSync: React.FC<AuthSyncProps> = ({ children }) => {
  const { associations: authAssociations, isAuthenticated } = useAuth();
  const { setUserAssociations, setSelectedInstitution } = useInstitution();

  useEffect(() => {
    console.log('🔄 [AUTH SYNC] Sincronizando asociaciones...');
    console.log('🔄 [AUTH SYNC] isAuthenticated:', isAuthenticated);
    console.log('🔄 [AUTH SYNC] authAssociations:', authAssociations);
    
    if (isAuthenticated && authAssociations) {
      console.log('✅ [AUTH SYNC] Usuario autenticado, configurando asociaciones');
      console.log('📊 [AUTH SYNC] Número de asociaciones:', authAssociations.length);
      
      // Log detallado de cada asociación
      authAssociations.forEach((assoc, index) => {
        console.log(`📋 [AUTH SYNC] Asociación ${index + 1}:`, {
          id: assoc._id,
          status: assoc.status,
          account: assoc.account?.nombre,
          division: assoc.division?.nombre,
          student: assoc.student ? {
            id: assoc.student._id,
            name: assoc.student.nombre,
            avatar: assoc.student.avatar
          } : null,
          role: assoc.role?.nombre
        });
      });
      
      setUserAssociations(authAssociations);
      
      // Solo seleccionar automáticamente si hay una sola asociación
      if (authAssociations.length === 1) {
        console.log('🎯 [AUTH SYNC] Una sola asociación, seleccionando automáticamente...');
        const singleAssociation = authAssociations[0];
        console.log('✅ [AUTH SYNC] Institución seleccionada:', {
          id: singleAssociation._id,
          account: singleAssociation.account?.nombre,
          division: singleAssociation.division?.nombre,
          student: singleAssociation.student ? {
            id: singleAssociation.student._id,
            name: singleAssociation.student.nombre,
            avatar: singleAssociation.student.avatar
          } : null
        });
        setSelectedInstitution(singleAssociation);
      } else if (authAssociations.length > 1) {
        console.log('🎯 [AUTH SYNC] Múltiples asociaciones, el usuario debe seleccionar');
        // No seleccionar automáticamente, dejar que el usuario elija
        setSelectedInstitution(null);
      }
    } else {
      // Si no está autenticado, limpiar las asociaciones
      console.log('🚪 [AUTH SYNC] Usuario no autenticado, limpiando asociaciones');
      setUserAssociations([]);
      setSelectedInstitution(null);
    }
  }, [authAssociations, isAuthenticated, setUserAssociations, setSelectedInstitution]);

  return <>{children}</>;
};

export default AuthSync; 