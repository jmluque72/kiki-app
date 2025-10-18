import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList
} from 'react-native';
import { WebView } from 'react-native-webview';
import documentService, { Document } from '../src/services/documentService';
import { toastService } from '../src/services/toastService';
import { useAuth } from "../contexts/AuthContextHybrid"

interface TerminosCondicionesScreenProps {
  onBack: () => void;
}

const TerminosCondicionesScreen: React.FC<TerminosCondicionesScreenProps> = ({ onBack }) => {
  const { activeAssociation } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!activeAssociation?.account?._id) {
        throw new Error('No se encontró institución activa');
      }
      
      const data = await documentService.getDocuments(activeAssociation.account._id);
      setDocuments(data);
    } catch (error: any) {
      console.error('Error al cargar documentos:', error);
      setError(error.message);
      toastService.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInBrowser = async (document: Document) => {
    try {
      // Usar Google Docs Viewer para una mejor experiencia
      const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(document.archivo.url)}`;
      
      const supported = await Linking.canOpenURL(viewerUrl);
      if (supported) {
        await Linking.openURL(viewerUrl);
      } else {
        // Fallback a la URL original
        await Linking.openURL(document.archivo.url);
      }
    } catch (error) {
      console.error('Error al abrir enlace:', error);
      Alert.alert('Error', 'No se pudo abrir el documento');
    }
  };

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => handleSelectDocument(item)}
    >
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{item.titulo}</Text>
        <Text style={styles.documentDate}>
          {new Date(item.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.openButton}
        onPress={() => handleOpenInBrowser(item)}
      >
        <Text style={styles.openButtonText}>Ver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documentos</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E5FCE" />
          <Text style={styles.loadingText}>Cargando documentos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documentos</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📄</Text>
          <Text style={styles.errorTitle}>Documentos no disponibles</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadDocuments}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedDocument) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedDocument(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDocument.titulo}</Text>
        </View>

        <View style={styles.documentViewer}>
          <WebView
            source={{ 
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; padding: 0; background: #f5f5f5; }
                    iframe { 
                      width: 100%; 
                      height: 100vh; 
                      border: none; 
                      background: white;
                    }
                    .loading {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      text-align: center;
                      color: #666;
                    }
                  </style>
                </head>
                <body>
                  <div class="loading" id="loading">Cargando PDF...</div>
                  <iframe 
                    src="${selectedDocument.archivo.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                    onload="document.getElementById('loading').style.display='none'"
                    onerror="document.getElementById('loading').innerHTML='Error al cargar el PDF'"
                  ></iframe>
                </body>
                </html>
              `
            }}
            style={styles.webView}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setError('Error al cargar el documento PDF');
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView HTTP error:', nativeEvent);
              setError('Error al cargar el documento PDF');
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#0E5FCE" />
                <Text style={styles.webViewLoadingText}>Cargando PDF...</Text>
              </View>
            )}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="compatibility"
            onShouldStartLoadWithRequest={(request) => {
              // Solo permitir la URL del PDF original
              return request.url === selectedDocument.archivo.url || 
                     request.url.includes(selectedDocument.archivo.url) ||
                     request.url.startsWith('data:') ||
                     request.url.startsWith('about:');
            }}
          />
        </View>

        <TouchableOpacity 
          style={styles.openInBrowserButton}
          onPress={() => handleOpenInBrowser(selectedDocument)}
        >
          <Text style={styles.openInBrowserButtonText}>Ver documento completo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documentos</Text>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No hay documentos</Text>
          <Text style={styles.emptyMessage}>
            No se encontraron documentos para esta institución.
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item._id}
          style={styles.documentsList}
          contentContainerStyle={styles.documentsListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  documentsList: {
    flex: 1,
  },
  documentsListContent: {
    padding: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  openButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  documentViewer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  webViewLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  openInBrowserButton: {
    margin: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0E5FCE',
    borderRadius: 12,
    alignItems: 'center',
  },
  openInBrowserButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TerminosCondicionesScreen;