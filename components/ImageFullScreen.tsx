import React, { useState } from 'react';
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Text,
  FlatList
} from 'react-native';
import Toast from 'react-native-toast-message';
import favoriteService from '../src/services/favoriteService';
import { toastService } from '../src/services/toastService';
import { toastConfig } from '../src/config/toastConfig';

const { width, height } = Dimensions.get('window');

interface ImageFullScreenProps {
  visible: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  activityId: string;
  studentId: string;
  isFavorite: boolean;
  onFavoriteToggle: (isFavorite: boolean) => void;
  activityTitle?: string;
  activityDescription?: string;
}

const ImageFullScreen: React.FC<ImageFullScreenProps> = ({
  visible,
  images,
  currentIndex,
  onClose,
  onIndexChange,
  activityId,
  studentId,
  isFavorite,
  onFavoriteToggle,
  activityTitle,
  activityDescription
}) => {
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newFavoriteStatus = !isFavorite;
      await favoriteService.toggleFavorite(activityId, studentId, newFavoriteStatus);
      onFavoriteToggle(newFavoriteStatus);
      
      toastService.favorite(
        newFavoriteStatus ? 'Agregado a favoritos' : 'Eliminado de favoritos',
        newFavoriteStatus ? 'La actividad se guardó en tus favoritos' : 'La actividad se eliminó de tus favoritos'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toastService.error('Error', 'No se pudo actualizar el favorito');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  if (!visible || !images || images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* Botón de cerrar */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonBackground}>
            <View style={styles.closeIcon}>
              <View style={styles.closeLine1} />
              <View style={styles.closeLine2} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Botón de favorito */}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleToggleFavorite}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={styles.favoriteButtonBackground}>
            {loading ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <Text style={styles.favoriteIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Contador de imágenes */}
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <View style={styles.counterBackground}>
              <View style={styles.counterText}>
                {currentIndex + 1} / {images.length}
              </View>
            </View>
          </View>
        )}

        {/* Carrusel de imágenes */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentIndex}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            onIndexChange(index);
          }}
          renderItem={({ item }) => (
            <ScrollView
              style={styles.imageContainer}
              contentContainerStyle={styles.imageContentContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
              />
            </ScrollView>
          )}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* Footer con título y descripción */}
        {(activityTitle || activityDescription) && (
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              {activityTitle && (
                <Text style={styles.footerTitle} numberOfLines={2}>
                  {activityTitle}
                </Text>
              )}
              {activityDescription && (
                <Text style={styles.footerDescription} numberOfLines={4}>
                  {activityDescription}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Toast dentro del modal para asegurar que aparezca por encima */}
        <Toast 
          config={toastConfig} 
          style={{ zIndex: 99999, elevation: 1000 }}
          topOffset={100}
          visibilityTime={3000}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  closeButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  closeLine1: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    top: 9,
  },
  closeLine2: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    top: 9,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  favoriteButtonBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  counterBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    width: width,
    height: height,
  },
  imageContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  swipeLeftArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.3,
    zIndex: 5,
  },
  swipeRightArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.3,
    zIndex: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerContent: {
    maxWidth: width - 40,
  },
  footerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  footerDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});

export default ImageFullScreen;
