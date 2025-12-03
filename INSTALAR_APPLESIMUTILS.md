# Instalar applesimutils

Para ejecutar los tests E2E en iOS, necesitas instalar `applesimutils`. 

## Opción 1: Usando Homebrew (Recomendado)

```bash
brew tap wix/brew
brew install applesimutils
```

## Opción 2: Compilar desde el código fuente

```bash
cd /tmp
git clone https://github.com/wix/AppleSimulatorUtils.git
cd AppleSimulatorUtils
xcodebuild -workspace AppleSimulatorUtils.xcworkspace -scheme applesimutils -configuration Release -derivedDataPath ./build
sudo cp build/Build/Products/Release/applesimutils /usr/local/bin/
```

## Verificar instalación

```bash
applesimutils --version
```

Una vez instalado, podrás ejecutar los tests:

```bash
cd KikiApp
npm run e2e:test:ios
```


