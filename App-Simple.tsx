import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  console.log('🚀 App Simple iniciando...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>KikiApp - Versión Simple</Text>
      <Text style={styles.subtext}>Si ves esto, la app está funcionando</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E5FCE',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default App;

