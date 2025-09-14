import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Association } from '../src/services/api';
import { Shared } from '../src/services/sharedService';
import { useAuth } from './AuthContext';

interface InstitutionContextType {
  selectedInstitution: Shared | null;
  setSelectedInstitution: (institution: Shared | null) => void;
  userAssociations: Shared[];
  setUserAssociations: (associations: Shared[]) => void;
  getActiveStudent: () => Shared['student'] | null;
  getActiveInstitution: () => { account: any; role: any; division?: any; student?: any } | null;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

interface InstitutionProviderProps {
  children: ReactNode;
}

export const InstitutionProvider: React.FC<InstitutionProviderProps> = ({ children }) => {
  const [selectedInstitution, setSelectedInstitution] = useState<Shared | null>(null);
  const [userAssociations, setUserAssociations] = useState<Shared[]>([]);
  const { activeAssociation } = useAuth();

  // Sincronizar selectedInstitution con activeAssociation cuando cambie
  useEffect(() => {
    console.log('🔄 [InstitutionContext] activeAssociation cambió:', activeAssociation ? {
      account: activeAssociation.account?.nombre,
      role: activeAssociation.role?.nombre,
      division: activeAssociation.division?.nombre,
      student: activeAssociation.student?.nombre
    } : null);

    if (activeAssociation) {
      // Buscar la asociación correspondiente en userAssociations
      const matchingAssociation = userAssociations.find(assoc => 
        assoc._id === activeAssociation.activeShared ||
        (assoc.account._id === activeAssociation.account._id && 
         assoc.role._id === activeAssociation.role._id &&
         assoc.division?._id === activeAssociation.division?._id)
      );

      if (matchingAssociation) {
        console.log('✅ [InstitutionContext] Actualizando selectedInstitution con activeAssociation');
        setSelectedInstitution(matchingAssociation);
      } else {
        console.log('⚠️ [InstitutionContext] No se encontró asociación matching para activeAssociation');
      }
    } else {
      console.log('ℹ️ [InstitutionContext] No hay activeAssociation, manteniendo selectedInstitution actual');
    }
  }, [activeAssociation, userAssociations]);

  // Función para obtener el estudiante activo
  const getActiveStudent = () => {
    console.log('🎓 [GET ACTIVE STUDENT] Buscando estudiante activo...');
    console.log('🎓 [GET ACTIVE STUDENT] activeAssociation:', activeAssociation ? {
      account: activeAssociation.account?.nombre,
      student: activeAssociation.student ? {
        id: activeAssociation.student._id,
        name: activeAssociation.student.nombre,
        avatar: activeAssociation.student.avatar
      } : null
    } : null);
    console.log('🎓 [GET ACTIVE STUDENT] selectedInstitution:', selectedInstitution ? {
      id: selectedInstitution._id,
      account: selectedInstitution.account?.nombre,
      student: selectedInstitution.student ? {
        id: selectedInstitution.student._id,
        name: selectedInstitution.student.nombre,
        avatar: selectedInstitution.student.avatar
      } : null
    } : null);
    console.log('🎓 [GET ACTIVE STUDENT] userAssociations count:', userAssociations.length);
    
    // PRIORIDAD 1: Usar el estudiante de la asociación activa si existe
    if (activeAssociation?.student) {
      console.log('✅ [GET ACTIVE STUDENT] Usando estudiante de activeAssociation:', {
        id: activeAssociation.student._id,
        name: activeAssociation.student.nombre,
        avatar: activeAssociation.student.avatar
      });
      return activeAssociation.student;
    }
    
    // PRIORIDAD 2: Si hay una institución seleccionada, usar su estudiante
    if (selectedInstitution?.student) {
      console.log('✅ [GET ACTIVE STUDENT] Usando estudiante de selectedInstitution:', {
        id: selectedInstitution.student._id,
        name: selectedInstitution.student.nombre,
        avatar: selectedInstitution.student.avatar
      });
      return selectedInstitution.student;
    }
    
    // PRIORIDAD 3: Si no hay institución seleccionada, usar el estudiante de la primera asociación
    if (userAssociations.length > 0 && userAssociations[0].student) {
      console.log('✅ [GET ACTIVE STUDENT] Usando estudiante de primera asociación:', {
        id: userAssociations[0].student._id,
        name: userAssociations[0].student.nombre,
        avatar: userAssociations[0].student.avatar
      });
      return userAssociations[0].student;
    }
    
    console.log('❌ [GET ACTIVE STUDENT] No se encontró estudiante activo');
    return null;
  };

  // Función para obtener la institución activa (desde la asociación activa)
  const getActiveInstitution = () => {
    console.log('🏫 [GET ACTIVE INSTITUTION] Obteniendo institución activa...');
    
    if (activeAssociation) {
      console.log('✅ [GET ACTIVE INSTITUTION] Usando asociación activa:', {
        account: activeAssociation.account.nombre,
        role: activeAssociation.role.nombre,
        division: activeAssociation.division?.nombre,
        student: activeAssociation.student ? `${activeAssociation.student.nombre} ${activeAssociation.student.apellido}` : null
      });
      
      return {
        account: activeAssociation.account,
        role: activeAssociation.role,
        division: activeAssociation.division,
        student: activeAssociation.student
      };
    }
    
    console.log('ℹ️ [GET ACTIVE INSTITUTION] No hay asociación activa, usando selectedInstitution');
    return null;
  };

  const value = {
    selectedInstitution,
    setSelectedInstitution,
    userAssociations,
    setUserAssociations,
    getActiveStudent,
    getActiveInstitution,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}; 