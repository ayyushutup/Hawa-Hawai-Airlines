import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Plane, Calendar, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function CancelBooking() {
    const [reference, setReference] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cancellationResult, setCancellationResult] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const lookupBooking = async () => {
        if (!reference.trim()) {
            setError('Please enter a booking reference');
            return;
        }

        setLoading(true);
        setError(null);
        setBooking(null);
        setCancellationResult(null);

        try {
            const res = await fetch(`${API_URL}/bookings/${reference.toUpperCase()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Booking not found');
            } else {
                setBooking(data);
            }
        } catch {
            setError('Failed to look up booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/bookings/${reference.toUpperCase()}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Customer requested cancellation' })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to cancel booking');
            } else {
                setCancellationResult(data);
                setBooking(null);
            }
        } catch {
            setError('Failed to cancel booking. Please try again.');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="pt-20 min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-primary text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Cancel Booking</h1>
                    <p className="text-gray-300 text-lg">Enter your booking reference to view and cancel your reservation</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Booking Reference
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value.toUpperCase())}
                            placeholder="e.g. ABC123"
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none text-lg font-mono uppercase"
                            maxLength={10}
                        />
                        <button
                            onClick={lookupBooking}
                            disabled={loading}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            {loading ? 'Searching...' : 'Find'}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                        <XCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Booking Details */}
                {booking && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="bg-primary text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-secondary font-bold text-sm uppercase tracking-wider">Booking Reference</p>
                                    <p className="text-3xl font-mono font-bold">{booking.booking_reference}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${booking.status === 'Confirmed' ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {booking.flight && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <Plane className="w-8 h-8 text-secondary" />
                                    <div>
                                        <p className="font-bold text-primary">{booking.flight.flight_number}</p>
                                        <p className="text-sm text-gray-500">
                                            {booking.flight.origin_code} → {booking.flight.destination_code}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Passenger</p>
                                        <p className="font-semibold">{booking.passenger_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Booked On</p>
                                        <p className="font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Amount Paid</span>
                                    <span className="text-2xl font-bold text-primary">₹{booking.price_paid?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {booking.status === 'Confirmed' && (
                            <div className="p-6 bg-gray-50 border-t">
                                {!showConfirm ? (
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Cancel This Booking
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-yellow-800">Are you sure?</p>
                                                <p className="text-sm text-yellow-700">This action cannot be undone. Refund will be calculated based on our cancellation policy.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowConfirm(false)}
                                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                                            >
                                                Keep Booking
                                            </button>
                                            <button
                                                onClick={cancelBooking}
                                                disabled={loading}
                                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Cancellation Success */}
                {cancellationResult && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-green-500 text-white p-6 text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold">Booking Cancelled</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <p className="text-gray-500">Reference</p>
                                <p className="text-2xl font-mono font-bold text-primary">{cancellationResult.booking_reference}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Refund Percentage</span>
                                    <span className="font-bold">{cancellationResult.refund_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Refund Amount</span>
                                    <span className="text-xl font-bold text-green-600">₹{cancellationResult.refund_amount?.toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                Your refund will be processed within 5-7 business days.
                            </p>
                        </div>
                    </div>
                )}

                {/* Cancellation Policy */}
                <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="font-bold text-primary mb-4">Cancellation Policy</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span><strong>72+ hours before departure:</strong> 100% refund</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span><strong>24-72 hours before departure:</strong> 75% refund</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span><strong>2-24 hours before departure:</strong> 50% refund</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span><strong>Less than 2 hours:</strong> No refund</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
