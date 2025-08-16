import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { PrinterState, PrinterContextType } from '../types';

// Define state variables for USB connection to be accessible in different functions
let usbDevice: USBDevice | null = null;
let usbEndpointNumber: number | null = null;
let btCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

const defaultState: PrinterState = {
    isConnected: false,
    connectionType: 'none',
    device: null,
    statusMessage: 'Tidak ada printer terhubung.',
};

export const PrinterContext = createContext<PrinterContextType>({
    ...defaultState,
    connectBluetooth: async () => {},
    connectUSB: async () => {},
    disconnect: () => {},
    print: async () => {},
});

export const PrinterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<PrinterState>(defaultState);

    const disconnect = useCallback(() => {
        if (state.connectionType === 'bluetooth' && state.device) {
            (state.device as BluetoothDevice).gatt?.disconnect();
        } else if (state.connectionType === 'usb' && state.device) {
            (state.device as USBDevice).close();
        }
        usbDevice = null;
        usbEndpointNumber = null;
        btCharacteristic = null;
        setState(defaultState);
        console.log('Printer disconnected.');
    }, [state.device, state.connectionType]);

    const connectBluetooth = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, statusMessage: 'Mencari printer Bluetooth... Pastikan printer menyala & dapat ditemukan.' }));
            // Filter for devices with the Serial Port Profile, common for thermal printers.
            const device = await navigator.bluetooth.requestDevice({
                filters: [{
                    services: ['00001101-0000-1000-8000-00805f9b34fb']
                }]
            });
            
            if (!device) {
                 setState(prev => ({...prev, statusMessage: 'Tidak ada perangkat dipilih.'}));
                 return;
            }

            setState(prev => ({ ...prev, statusMessage: `Menghubungkan ke ${device.name}...` }));
            
            const server = await device.gatt?.connect();
            if (!server) throw new Error("Gagal terhubung ke GATT server.");
            
            const services = await server.getPrimaryServices();
            let writableCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const characteristic of characteristics) {
                    if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
                        writableCharacteristic = characteristic;
                        break;
                    }
                }
                if (writableCharacteristic) break;
            }

            if (!writableCharacteristic) {
                throw new Error('Tidak ditemukan characteristic yang bisa ditulis pada perangkat ini.');
            }
            
            btCharacteristic = writableCharacteristic;
            device.addEventListener('gattserverdisconnected', disconnect);

            setState({
                isConnected: true,
                device,
                connectionType: 'bluetooth',
                statusMessage: `Terhubung ke: ${device.name} via Bluetooth`,
            });
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                setState(prev => ({ ...prev, statusMessage: 'Tidak ditemukan printer Bluetooth yang cocok. Pastikan printer menyala, dalam jangkauan, dan mendukung profil port serial.' }));
            } else {
                setState(prev => ({ ...prev, statusMessage: `Gagal terhubung: ${error.message}` }));
            }
        }
    }, [disconnect]);

     const connectUSB = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, statusMessage: 'Mencari printer USB... Pilih printer dari daftar.' }));
            // Filter for devices that identify as printers (class code 7)
            const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] });
            if (!device) {
                 setState(prev => ({...prev, statusMessage: 'Tidak ada perangkat dipilih.'}));
                 return;
            }

            setState(prev => ({ ...prev, statusMessage: `Membuka perangkat ${device.productName}...` }));
            await device.open();
            await device.selectConfiguration(1);
            await device.claimInterface(0);

            const anInterface = device.configuration?.interfaces[0];
            const endpoint = anInterface?.alternate?.endpoints.find(e => e.direction === 'out');
            
            if (!endpoint) {
                await device.close();
                throw new Error("Tidak ditemukan OUT endpoint pada printer USB.");
            }

            usbDevice = device;
            usbEndpointNumber = endpoint.endpointNumber;
            
            setState({
                isConnected: true,
                device: device,
                connectionType: 'usb',
                statusMessage: `Terhubung ke: ${device.productName} via USB`,
            });

        } catch (error: any) {
             if (error.name === 'NotFoundError') {
                setState(prev => ({ ...prev, statusMessage: 'Pencarian perangkat dibatalkan atau tidak ada printer ditemukan.' }));
            } else {
                setState(prev => ({ ...prev, statusMessage: `Gagal terhubung: ${error.message}` }));
            }
        }
    }, []);

    const print = useCallback(async (data: Uint8Array) => {
        if (!state.isConnected || !state.device) {
            throw new Error('Printer tidak terhubung.');
        }

        if (state.connectionType === 'bluetooth' && btCharacteristic) {
            const CHUNK_SIZE = 100; // Chunk data for Bluetooth
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                await btCharacteristic.writeValueWithoutResponse(chunk);
            }
        } else if (state.connectionType === 'usb' && usbDevice && usbEndpointNumber) {
            await usbDevice.transferOut(usbEndpointNumber, data);
        } else {
             throw new Error('Metode koneksi tidak valid atau koneksi hilang.');
        }
    }, [state.isConnected, state.connectionType, state.device]);

    return (
        <PrinterContext.Provider value={{ ...state, connectBluetooth, connectUSB, disconnect, print }}>
            {children}
        </PrinterContext.Provider>
    );
};
