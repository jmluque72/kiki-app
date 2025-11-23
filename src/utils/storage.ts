/**
 * Storage utility - wrapper for AsyncStorage
 * Using AsyncStorage directly since MMKV requires new architecture
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Re-export AsyncStorage directly
export default AsyncStorage;
