/*
  Seeeduino XIAO ESP32C3 + MPU6050 (GY-521) の簡易サンプル
  - I2C で MPU6050 を読み、しきい値を超えたら BLE で Notify
  - 実運用ではフィルタや誤検出対策を強化してください
*/

#include <Arduino.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// MPU6050 レジスタ
const int MPU_ADDR = 0x68;

// BLE UUIDs (カスタム)
#define SERVICE_UUID "0000fff0-0000-1000-8000-00805f9b34fb"
#define CHAR_UUID    "0000fff1-0000-1000-8000-00805f9b34fb"

BLECharacteristic *pCharacteristic;

void setupMPU(){
  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0);    // wake up
  Wire.endTransmission(true);
}

void setupBLE(){
  BLEDevice::init("MR_TAG_debug");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHAR_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
}

unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  setupMPU();
  setupBLE();
}

void loop() {
  // 簡易的に加速度の合成値を読み、閾値を超えたらイベント送信
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);
  int16_t ax = Wire.read()<<8 | Wire.read();
  int16_t ay = Wire.read()<<8 | Wire.read();
  int16_t az = Wire.read()<<8 | Wire.read();

  float a = sqrt((float)ax*ax + (float)ay*ay + (float)az*az)/16384.0; // g 単位

  if(a > 1.3 && millis() - lastSend > 2000){
    // 簡易 Notify（JSON 風）
    String payload = "{\"tag_id\":\"debug_fridge\",\"event\":\"OPEN\",\"confidence\":0.9,\"ts\":" + String(millis()/1000) + "}";
    pCharacteristic->setValue((uint8_t*)payload.c_str(), payload.length());
    pCharacteristic->notify();
    Serial.println("Sent event: " + payload);
    lastSend = millis();
  }

  delay(100);
}
