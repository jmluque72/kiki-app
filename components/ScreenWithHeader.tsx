import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import CommonHeader from './CommonHeader';
import SideMenu from './SideMenu';
import { useSideMenu } from '../src/hooks/useSideMenu';

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
            />
          </View>
        </View>
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
