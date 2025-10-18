#!/bin/bash

# Script para agregar assets al proyecto de Xcode
echo "🔧 Agregando assets al proyecto de Xcode..."

# Directorio raíz del proyecto React Native
RN_ROOT=$(dirname "$0")
cd "$RN_ROOT"

# 1. Verificar que los assets existan
if [ ! -d "ios/KikiApp/assets" ]; then
    echo "❌ Error: Assets no encontrados. Ejecuta primero ./fix-ios-assets.sh"
    exit 1
fi

# 2. Crear un script de Xcode para agregar los assets
cat > ios/add_assets_to_xcode.rb << 'EOF'
#!/usr/bin/env ruby

require 'xcodeproj'

# Abrir el proyecto
project_path = 'KikiApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Obtener el target principal
target = project.targets.find { |t| t.name == 'KikiApp' }

# Agregar la carpeta assets al proyecto
assets_path = 'KikiApp/assets'
if File.exist?(assets_path)
  # Crear un grupo para los assets
  assets_group = project.main_group.find_subpath('KikiApp', true)
  assets_group = assets_group.find_subpath('assets', true)
  
  # Agregar archivos recursivamente
  Dir.glob("#{assets_path}/**/*").each do |file_path|
    next if File.directory?(file_path)
    
    relative_path = file_path.sub("#{assets_path}/", "")
    file_ref = assets_group.new_reference(file_path)
    file_ref.set_source_tree('SOURCE_ROOT')
    
    # Agregar al target
    target.add_file_references([file_ref])
  end
  
  # Guardar el proyecto
  project.save
  puts "✅ Assets agregados al proyecto de Xcode"
else
  puts "❌ Error: Carpeta assets no encontrada"
end
EOF

# 3. Instalar xcodeproj si no está instalado
if ! gem list xcodeproj -i; then
    echo "📦 Instalando xcodeproj..."
    gem install xcodeproj
fi

# 4. Ejecutar el script
echo "🔧 Agregando assets al proyecto..."
cd ios
ruby add_assets_to_xcode.rb

echo "✅ Assets agregados al proyecto de Xcode"
echo "📱 Ahora abre Xcode y verifica que los assets estén en 'Copy Bundle Resources'"
