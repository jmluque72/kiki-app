import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Association } from '../src/services/api';
import { Shared } from '../src/services/sharedService';

interface InstitutionContextType {
  selectedInstitution: Shared | null;
  setSelectedInstitution: (institution: Shared | null) => void;
  userAssociations: Shared[];
  setUserAssociations: (associations: Shared[]) => void;
  getActiveStudent: () => Shared['student'] | null;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

interface InstitutionProviderProps {
  children: ReactNode;
}

export const InstitutionProvider: React.FC<InstitutionProviderProps> = ({ children }) => {
  const [selectedInstitution, setSelectedInstitution] = useState<Shared | null>(null);
  const [userAssociations, setUserAssociations] = useState<Shared[]>([]);

  // Función para obtener el estudiante activo
  const getActiveStudent = () => {
    console.log('🎓 [GET ACTIVE STUDENT] Buscando estudiante activo...');
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
    
    // Si hay una institución seleccionada, usar su estudiante
    if (selectedInstitution?.student) {
      console.log('✅ [GET ACTIVE STUDENT] Usando estudiante de selectedInstitution:', {
        id: selectedInstitution.student._id,
        name: selectedInstitution.student.nombre,
        avatar: selectedInstitution.student.avatar
      });
      return selectedInstitution.student;
    }
    
    // Si no hay institución seleccionada, usar el estudiante de la primera asociación
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

  const value = {
    selectedInstitution,
    setSelectedInstitution,
    userAssociations,
    setUserAssociations,
    getActiveStudent,
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