import Foundation
import React

@objc(PushTokenModule)
class PushTokenModule: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func getPushToken(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      // Leer el token desde UserDefaults
      if let token = UserDefaults.standard.string(forKey: "push_token") {
        print("🔔 [PushTokenModule] Token encontrado en UserDefaults: \(token.prefix(20))...")
        resolve(token)
      } else {
        print("🔔 [PushTokenModule] No hay token en UserDefaults")
        reject("NO_TOKEN", "No se encontró token de push notifications", nil)
      }
    }
  }
  
  @objc
  func setPushToken(_ token: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      // Guardar el token en UserDefaults
      UserDefaults.standard.set(token, forKey: "push_token")
      UserDefaults.standard.synchronize()
      print("🔔 [PushTokenModule] Token guardado en UserDefaults: \(token.prefix(20))...")
      resolve(true)
    }
  }
}

