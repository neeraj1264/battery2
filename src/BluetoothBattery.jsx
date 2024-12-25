import React, { useState } from 'react';

const BluetoothBattery = () => {
  const [deviceName, setDeviceName] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [deviceUUID, setDeviceUUID] = useState(null);
  const [serviceUUID, setServiceUUID] = useState(null);
  const [characteristicUUID, setCharacteristicUUID] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    // Check if the browser supports the Web Bluetooth API
    if (!navigator.bluetooth) {
      setError('Bluetooth is not supported in this browser.');
      return;
    }

    try {
      // Request a Bluetooth device with the battery service
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });

      setDeviceName(device.name || 'Unknown Device');
      setDeviceUUID(device.id); // Set the device UUID

      // Connect to the GATT server
      const server = await device.gatt.connect();

      // Get the Battery Service
      const service = await server.getPrimaryService('battery_service');
      setServiceUUID(service.uuid); // Set the service UUID

      // Get the Battery Level Characteristic
      const characteristic = await service.getCharacteristic('battery_level');
      setCharacteristicUUID(characteristic.uuid); // Set the characteristic UUID

      // Read the Battery Level value
      const value = await characteristic.readValue();
      const batteryPercentage = value.getUint8(0);

      // Update state with the battery level
      setBatteryLevel(batteryPercentage);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to retrieve battery level. Make sure the device supports Battery Service.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bluetooth Battery Checker</h1>
      <button onClick={handleConnect} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Connect to Bluetooth Device
      </button>
      {deviceName && <p>Connected to: {deviceName}</p>}
      {deviceUUID && <p>Device UUID: {deviceUUID}</p>}
      {serviceUUID && <p>Service UUID: {serviceUUID}</p>}
      {characteristicUUID && <p>Characteristic UUID: {characteristicUUID}</p>}
      {batteryLevel !== null && <p>Battery Level: {batteryLevel}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default BluetoothBattery;
