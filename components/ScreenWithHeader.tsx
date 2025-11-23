import React, { useState } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import CommonHeader from './CommonHeader';
import SideMenu from './SideMenu';
import { useSideMenu } from '../src/hooks/useSideMenu';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import FormulariosScreen from '../screens/FormulariosScreen';
import CompleteFormScreen from '../screens/CompleteFormScreen';
import FormRequestService, { FormRequest } from '../src/services/formRequestService';

interface ScreenWithHeaderProps {
  children: React.ReactNode;
  onOpenNotifications: () => void;
  onOpenActiveAssociation?: () => void;
  activeStudent?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
}

const ScreenWithHeader: React.FC<ScreenWithHeaderProps> = ({
  children,
  onOpenNotifications,
  onOpenActiveAssociation,
  activeStudent
}) => {
  const { showMenu, openMenu, closeMenu } = useSideMenu();
  const { user } = useAuth();
  const { getActiveStudent } = useInstitution();
  const [showFormularios, setShowFormularios] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedFormRequest, setSelectedFormRequest] = useState<FormRequest | null>(null);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);

  return (
    <View style={styles.container}>
      <CommonHeader 
        onOpenNotifications={onOpenNotifications}
        onOpenMenu={openMenu}
        activeStudent={activeStudent}
      />
      
      {children}
      
      {/* Modal del menú lateral */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={closeMenu}
      >
        <View style={styles.menuModalOverlay}>
          {/* Overlay para cerrar el menú tocando fuera */}
          <View style={styles.overlayTouchable} onTouchEnd={closeMenu} />
          
          <View style={styles.menuModalContainer}>
            <SideMenu 
              navigation={{}} 
              onClose={closeMenu}
              onOpenActiveAssociation={() => {
                closeMenu();
                onOpenActiveAssociation?.();
              }}
              openFormularios={() => {
                closeMenu();
                setShowFormularios(true);
              }}
              pendingFormsCount={pendingFormsCount}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Formularios */}
      <Modal
        visible={showFormularios}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowFormularios(false)}
      >
        {showFormularios && (
          <FormulariosScreen
            onBack={() => {
              setShowFormularios(false);
            }}
            onCompleteForm={(formRequest) => {
              setSelectedFormRequest(formRequest);
              setShowFormularios(false);
              setShowCompleteForm(true);
            }}
          />
        )}
      </Modal>

      {/* Modal de Completar Formulario */}
      <Modal
        visible={showCompleteForm}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowCompleteForm(false);
          setSelectedFormRequest(null);
          setShowFormularios(true);
        }}
      >
        {showCompleteForm && selectedFormRequest && (
          <CompleteFormScreen
            formRequest={selectedFormRequest}
            onBack={() => {
              setShowCompleteForm(false);
              setSelectedFormRequest(null);
              setShowFormularios(true);
            }}
            onComplete={() => {
              setShowCompleteForm(false);
              setSelectedFormRequest(null);
              // Recargar cantidad de formularios pendientes
              const activeStudent = getActiveStudent();
              if (user?._id && activeStudent?._id) {
                FormRequestService.getPendingForms(user._id, activeStudent._id)
                  .then(forms => {
                    setPendingFormsCount(forms.length);
                  })
                  .catch(error => console.error('Error recargando formularios:', error));
              }
            }}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  menuModalContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});

export default ScreenWithHeader;
