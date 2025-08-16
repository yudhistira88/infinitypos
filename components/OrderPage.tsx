import React from 'react';
import { Order } from '../types';

interface OrderPageProps {
    orders: Order[];
}

const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const OrderPage: React.FC<OrderPageProps> = ({ orders }) => {
    return (
        <div className="bg-white rounded-md shadow">
            <div className="bg-blue-800 text-white p-3 flex items-center justify-between rounded-t-md">
                <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <h2 className="text-lg font-semibold">Manajemen Order</h2>
                </div>
            </div>
            <div className="p-4">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">No. Bon</th>
                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Customer</th>
                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Tanggal</th>
                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Metode Bayar</th>
                                    <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">Total</th>
                                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Status</th>
                                    <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                                        <td className="py-2 px-4 border-b text-sm text-gray-700 font-medium">{order.bon}</td>
                                        <td className="py-2 px-4 border-b text-sm text-gray-700">{order.customer}</td>
                                        <td className="py-2 px-4 border-b text-sm text-gray-700">{order.date}</td>
                                        <td className="py-2 px-4 border-b text-sm text-gray-700">{order.paymentMethod}</td>
                                        <td className="py-2 px-4 border-b text-sm text-gray-700 text-right">{formatRupiah(order.grandTotal)}</td>
                                        <td className="py-2 px-4 border-b text-sm text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b text-sm text-center">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Detail</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                         <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <h3 className="text-lg font-semibold text-gray-700">Belum Ada Order</h3>
                        <p className="text-gray-500 mt-1">Transaksi yang selesai akan muncul di sini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderPage;