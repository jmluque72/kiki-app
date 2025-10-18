#!/usr/bin/env node

/**
 * Script para debugging de builds de producción
 * Este script ayuda a diagnosticar problemas en builds de producción
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 KikiApp - Production Build Debugger');
console.log('=====================================\n');

// Función para verificar archivos críticos
function checkCriticalFiles() {
  console.log('📁 Verificando archivos críticos...');
  
  const criticalFiles = [
    'App.tsx',
    'src/config/apiConfig.ts',
    'src/config/sentryConfig.ts',
    'src/utils/logger.ts',
    'components/ErrorBoundary.tsx',
    'package.json'
  ];
  
  const missingFiles = [];
  
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - FALTANTE`);
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  Archivos faltantes: ${missingFiles.join(', ')}`);
  }
  
  return missingFiles.length === 0;
}

// Función para verificar configuración de API
function checkApiConfig() {
  console.log('\n🌐 Verificando configuración de API...');
  
  try {
    const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.ts');
    const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
    
    // Verificar que no esté usando localhost en producción
    if (apiConfigContent.includes('localhost') || apiConfigContent.includes('127.0.0.1')) {
      console.log('⚠️  ADVERTENCIA: Configuración de API contiene localhost/127.0.0.1');
      console.log('   Esto puede causar problemas en producción');
    }
    
    // Verificar que tenga configuración de producción
    if (apiConfigContent.includes('api.kiki.com.ar')) {
      console.log('✅ Configuración de API de producción encontrada');
    } else {
      console.log('⚠️  No se encontró configuración de API de producción');
    }
    
  } catch (error) {
    console.log('❌ Error al verificar configuración de API:', error.message);
  }
}

// Función para verificar dependencias
function checkDependencies() {
  console.log('\n📦 Verificando dependencias críticas...');
  
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const criticalDeps = [
      '@sentry/react-native',
      'react-native',
      'react',
      '@react-navigation/native'
    ];
    
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]} (dev)`);
      } else {
        console.log(`❌ ${dep} - NO INSTALADO`);
      }
    });
    
  } catch (error) {
    console.log('❌ Error al verificar dependencias:', error.message);
  }
}

// Función para verificar configuración de Sentry
function checkSentryConfig() {
  console.log('\n🚨 Verificando configuración de Sentry...');
  
  try {
    const sentryConfigPath = path.join(__dirname, 'src/config/sentryConfig.ts');
    const sentryConfigContent = fs.readFileSync(sentryConfigPath, 'utf8');
    
    if (sentryConfigContent.includes('your-sentry-dsn')) {
      console.log('⚠️  ADVERTENCIA: DSN de Sentry no configurado');
      console.log('   Necesitas configurar tu DSN real en src/config/sentryConfig.ts');
    } else if (sentryConfigContent.includes('sentry.io')) {
      console.log('✅ Configuración de Sentry encontrada');
    } else {
      console.log('⚠️  Configuración de Sentry no clara');
    }
    
  } catch (error) {
    console.log('❌ Error al verificar configuración de Sentry:', error.message);
  }
}

// Función para generar reporte de debugging
function generateDebugReport() {
  console.log('\n📊 Generando reporte de debugging...');
  
  const report = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    files: {
      criticalFiles: checkCriticalFiles(),
      apiConfig: true, // Se verifica en checkApiConfig
      sentryConfig: true, // Se verifica en checkSentryConfig
    },
    recommendations: []
  };
  
  // Agregar recomendaciones basadas en las verificaciones
  if (!report.files.criticalFiles) {
    report.recommendations.push('Verificar que todos los archivos críticos estén presentes');
  }
  
  report.recommendations.push('Configurar DSN de Sentry real para crash reporting');
  report.recommendations.push('Verificar que la configuración de API use URLs de producción');
  report.recommendations.push('Probar la app en dispositivos físicos antes de publicar');
  
  // Guardar reporte
  const reportPath = path.join(__dirname, 'debug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Reporte guardado en: ${reportPath}`);
  
  return report;
}

// Función principal
function main() {
  console.log('Iniciando verificación de build de producción...\n');
  
  const allGood = checkCriticalFiles();
  checkApiConfig();
  checkDependencies();
  checkSentryConfig();
  
  const report = generateDebugReport();
  
  console.log('\n📋 Resumen:');
  console.log('===========');
  
  if (allGood) {
    console.log('✅ Verificación básica completada');
  } else {
    console.log('❌ Se encontraron problemas que deben resolverse');
  }
  
  console.log('\n💡 Próximos pasos:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n🔧 Para debugging adicional:');
  console.log('1. Revisar logs de Sentry después de publicar');
  console.log('2. Usar React Native Debugger para builds de desarrollo');
  console.log('3. Verificar logs del dispositivo usando Xcode/Android Studio');
  console.log('4. Probar en diferentes dispositivos y versiones de OS');
  
  console.log('\n✨ Debugging completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkCriticalFiles,
  checkApiConfig,
  checkDependencies,
  checkSentryConfig,
  generateDebugReport
};
