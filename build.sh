cp assets/design/icons/* ios/assets/assets/design/icons
cp assets/design/icons/* ios/KikiApp/assets/assets/design/icons

npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/KikiApp/
