import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from './fonts';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={styles.successToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastSubtitle}>{text2}</Text>}
    </View>
  ),
  
  error: ({ text1, text2 }: any) => (
    <View style={styles.errorToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastSubtitle}>{text2}</Text>}
    </View>
  ),
  
  info: ({ text1, text2 }: any) => (
    <View style={styles.infoToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastSubtitle}>{text2}</Text>}
    </View>
  ),
  
  favorite: ({ text1, text2 }: any) => (
    <View style={styles.favoriteToast}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastSubtitle}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  successToast: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1000,
    zIndex: 99999,
  },
  
  errorToast: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1000,
    zIndex: 99999,
  },
  
  infoToast: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1000,
    zIndex: 99999,
  },
  
  favoriteToast: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1000,
    zIndex: 99999,
  },
  
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 2,
  },
  
  toastSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.regular,
    opacity: 0.9,
  },
});
