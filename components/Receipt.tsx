import React from 'react';
import { ReceiptData, StoreSettings } from '../types';
import ModernReceipt from './ModernReceipt';
import SimpleReceipt from './SimpleReceipt';

interface ReceiptProps {
    data: ReceiptData | null;
    settings: StoreSettings;
}

const Receipt: React.FC<ReceiptProps> = ({ data, settings }) => {
    if (!data) {
        return <div id="printable-receipt" className="hidden"></div>;
    }

    if (settings.receiptTemplate === 'modern') {
        return <ModernReceipt data={data} settings={settings} />;
    }
    
    return <SimpleReceipt data={data} settings={settings} />;
};

export default Receipt;