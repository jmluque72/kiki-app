import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { useSideMenu } from '../src/hooks/useSideMenu';
import SideMenu from './SideMenu';
import AssociationsScreen from '../screens/AssociationsScreen';
import QuienRetiraScreen from '../screens/QuienRetiraScreen';
import AcercaDeScreen from '../screens/AcercaDeScreen';
import TerminosCondicionesScreen from '../screens/TerminosCondicionesScreen';

/**
 * Higher-Order Component que agrega funcionalidad de menú hamburguesa
 * a cualquier pantalla que use CommonHeader
 */
const withSideMenu = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithSideMenuComponent = (props: P) => {
    const { showMenu, openMenu, closeMenu } = useSideMenu();
  const [showAssociations, setShowAssociations] = useState(false);
  const [showQuienRetira, setShowQuienRetira] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showTerminosCondiciones, setShowTerminosCondiciones] = useState(false);
    

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
                       onOpenAcercaDe={() => {
                         closeMenu();
                         setShowAcercaDe(true);
                       }}
                       onOpenTerminosCondiciones={() => {
                         closeMenu();
                         setShowTerminosCondiciones(true);
                       }}
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
