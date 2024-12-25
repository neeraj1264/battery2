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
      setDeviceUUID(convertTo128BitUUID(device.id)); // Set the device UUID

      // Connect to the GATT server
      const server = await device.gatt.connect();

      // Get the Battery Service
      const service = await server.getPrimaryService('battery_service');
      setServiceUUID(convertTo128BitUUID(service.uuid)); // Set the service UUID

      // Get the Battery Level Characteristic
      const characteristic = await service.getCharacteristic('battery_level');
      setCharacteristicUUID(convertTo128BitUUID(characteristic.uuid)); // Set the characteristic UUID

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

  // Function to convert UUID to 128-bit format
  const convertTo128BitUUID = (uuid) => {
    // Check if the UUID is already in 128-bit format
    if (uuid.length === 36) {
      return uuid;
    }
    // Convert shorter UUIDs (e.g., 16-bit) to 128-bit by appending to a base string
    return `0000${uuid}-0000-1000-8000-00805f9b34fb`;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bluetooth Battery Checker</h1>
      <button onClick={handleConnect} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Connect to Bluetooth Device
      </button>
     {deviceName && <p>Connected to: {deviceName}</p>}
      <br />
      {deviceUUID && <p>Device UUID: {deviceUUID}</p>}
      <br />
      {serviceUUID && <p>Service UUID: {serviceUUID}</p>}
      <br />
      {characteristicUUID && <p>Characteristic UUID: {characteristicUUID}</p>}
      <br />
      {batteryLevel !== null && <p>Battery Level: {batteryLevel}%</p>}
      <br />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default BluetoothBattery;
