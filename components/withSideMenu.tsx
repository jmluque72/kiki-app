import React, { useState } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSideMenu } from '../src/hooks/useSideMenu';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import SideMenu from './SideMenu';
import AssociationsScreen from '../screens/AssociationsScreen';
import QuienRetiraScreen from '../screens/QuienRetiraScreen';
import RetirarScreen from '../screens/RetirarScreen';
import FamilyViewersScreen from '../screens/FamilyViewersScreen';
import AcercaDeScreen from '../screens/AcercaDeScreen';
import TerminosCondicionesScreen from '../screens/TerminosCondicionesScreen';
import StudentActionsScreen from '../src/screens/StudentActionsScreen';
import FamilyActionsCalendarScreen from '../src/screens/FamilyActionsCalendarScreen';
import FormulariosScreen from '../screens/FormulariosScreen';
import CompleteFormScreen from '../screens/CompleteFormScreen';
import FormRequestService, { FormRequest } from '../src/services/formRequestService';

/**
 * Higher-Order Component que agrega funcionalidad de menú hamburguesa
 * a cualquier pantalla que use CommonHeader
 */
const withSideMenu = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithSideMenuComponent = (props: P) => {
    const { showMenu, openMenu, closeMenu } = useSideMenu();
    const { user, activeAssociation } = useAuth();
    const { getActiveStudent } = useInstitution();
    const [showAssociations, setShowAssociations] = useState(false);
    const [showQuienRetira, setShowQuienRetira] = useState(false);
    const [showRetirar, setShowRetirar] = useState(false);
    const [showFamilyViewers, setShowFamilyViewers] = useState(false);
    const [showAcercaDe, setShowAcercaDe] = useState(false);
    const [showTerminosCondiciones, setShowTerminosCondiciones] = useState(false);
    const [showAcciones, setShowAcciones] = useState(false);
    const [showFormularios, setShowFormularios] = useState(false);
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [selectedFormRequest, setSelectedFormRequest] = useState<FormRequest | null>(null);
    const [pendingFormsCount, setPendingFormsCount] = useState(0);
    
    // Determinar qué pantalla de acciones mostrar según el rol
    const getUserRole = () => {
      if (activeAssociation?.role) {
        return activeAssociation.role.nombre || activeAssociation.role;
      }
      return user?.role?.nombre || '';
    };
    
    const getAccionesScreen = () => {
      const role = getUserRole();
      if (role === 'coordinador') {
        return <StudentActionsScreen onBack={() => setShowAcciones(false)} />;
      } else {
        // Para familyadmin y familyviewer
        return <FamilyActionsCalendarScreen onBack={() => setShowAcciones(false)} />;
      }
    };
    

    // Solo agregar onOpenMenu si el componente lo necesita
    const enhancedProps = {
      ...props,
      onOpenMenu: openMenu
    } as P & { onOpenMenu?: () => void };

    return (
      <>
        <WrappedComponent {...enhancedProps} />
        
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
                // Aquí puedes agregar la lógica para cambiar asociación activa
              }}
              onOpenAssociations={() => {
                closeMenu();
                setShowAssociations(true);
              }}
              onOpenQuienRetira={() => {
                closeMenu();
                setShowQuienRetira(true);
              }}
              onOpenRetirar={() => {
                closeMenu();
                setShowRetirar(true);
              }}
              onOpenFamilyViewers={() => {
                closeMenu();
                setShowFamilyViewers(true);
              }}
                       onOpenAcercaDe={() => {
                         closeMenu();
                         setShowAcercaDe(true);
                       }}
                       onOpenTerminosCondiciones={() => {
                         closeMenu();
                         setShowTerminosCondiciones(true);
                       }}
                       onOpenAcciones={() => {
                         closeMenu();
                         setShowAcciones(true);
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
        
        {/* Modal de Asociaciones */}
        <Modal
          visible={showAssociations}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowAssociations(false)}
        >
          <AssociationsScreen onBack={() => setShowAssociations(false)} />
        </Modal>
        
        {/* Modal de Quien Retira */}
        <Modal
          visible={showQuienRetira}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowQuienRetira(false)}
        >
          <QuienRetiraScreen onBack={() => setShowQuienRetira(false)} />
        </Modal>
        
        {/* Modal de Retirar */}
        <Modal
          visible={showRetirar}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowRetirar(false)}
        >
          <RetirarScreen onBack={() => setShowRetirar(false)} />
        </Modal>
        
        {/* Modal de Family Viewers */}
        <Modal
          visible={showFamilyViewers}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowFamilyViewers(false)}
        >
          <FamilyViewersScreen onBack={() => setShowFamilyViewers(false)} />
        </Modal>
        
        {/* Modal de Acerca de */}
        <Modal
          visible={showAcercaDe}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowAcercaDe(false)}
        >
          <AcercaDeScreen onBack={() => setShowAcercaDe(false)} />
        </Modal>

        {/* Modal de Términos y Condiciones */}
        <Modal
          visible={showTerminosCondiciones}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowTerminosCondiciones(false)}
        >
          <TerminosCondicionesScreen onBack={() => setShowTerminosCondiciones(false)} />
        </Modal>

        {/* Modal de Acciones */}
        <Modal
          visible={showAcciones}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowAcciones(false)}
        >
          {getAccionesScreen()}
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

      </>
    );
  };

  WithSideMenuComponent.displayName = `withSideMenu(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithSideMenuComponent;
};

const styles = StyleSheet.create({
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

export default withSideMenu;
