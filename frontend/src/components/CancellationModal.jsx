import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CancellationModal({ booking, onClose, onConfirm, loading }) {
    const [reason, setReason] = useState('');
    const refundEstimate = React.useMemo(() => {
        if (booking && booking.flight) {
            const departure = new Date(booking.flight.departure_time);
            const now = new Date();
            const diffHours = (departure - now) / (1000 * 60 * 60);
            const price = booking.price_paid || 0;

            let percent = 0;
            if (diffHours > 24) percent = 100;
            else if (diffHours > 12) percent = 50;
            else percent = 0;

            const refund = price * (percent / 100);
            const fee = price - refund;

            return { amount: refund, percent, fee };
        }
        return { amount: 0, percent: 0, fee: 0 };
    }, [booking]);

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Cancel Booking
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm text-amber-800 mb-2 font-medium">Refund Policy Estimate</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-gray-900">₹{refundEstimate.amount.toFixed(0)}</span>
                                <span className="text-sm text-gray-500 ml-1">Refund</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded">
                                    {refundEstimate.percent}% Back
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-500"
                                style={{ width: `${refundEstimate.percent}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>Cancellation Fee: ₹{refundEstimate.fee.toFixed(0)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reason for Cancellation</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                        >
                            <option value="">Select a reason...</option>
                            <option value="Change of plans">Change of plans</option>
                            <option value="Found a better price">Found a better price</option>
                            <option value="Medical emergency">Medical emergency</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Keep Flight
                        </button>
                        <button
                            onClick={() => onConfirm(booking.booking_reference, reason)}
                            disabled={!reason || loading}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Confirm Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
