import React, { useState, useEffect, useRef } from 'react';
import Invoice from './Invoice';
import CancellationModal from './CancellationModal';
import { api, ApiError } from '../services/api';
import { Download, XCircle, Plane, Loader2 } from 'lucide-react';

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null); // For modal
    const [cancellingRef, setCancellingRef] = useState(null); // For loading state
    const invoiceRef = useRef(null);

    const fetchBookings = async () => {
        const userData = localStorage.getItem('user');
        const token = userData ? JSON.parse(userData)?.access_token : null;
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const data = await api.getMyBookings();
            setBookings(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleViewInvoice = (booking) => {
        setSelectedBooking(booking);
    };

    const closeInvoice = () => {
        setSelectedBooking(null);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const initiateCancel = (booking) => {
        setBookingToCancel(booking);
    };

    const confirmCancellation = async (bookingRef, reason) => {
        setCancellingRef(bookingRef);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/bookings/${bookingRef}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                setBookingToCancel(null);
                fetchBookings(); // Refresh bookings
                // Optional: Show success toast/banner?
            } else {
                alert(data.error || 'Failed to cancel booking');
            }
        } catch {
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setCancellingRef(null);
        }
    };

    const getStatusBadge = (booking) => {
        if (booking.status === 'Cancelled') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Cancelled
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.payment_status === 'Completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                {booking.payment_status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        Prepare for takeoff. Here are your upcoming and past journeys.
                    </p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && bookings.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Plane className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-xl font-medium">No bookings yet</h3>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            Time to spread your wings? Search for flights now.
                        </p>
                        <div className="mt-6">
                            <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 dark:bg-accent dark:text-primary">
                                Book a Flight
                            </a>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200 ${booking.status === 'Cancelled' ? 'opacity-75' : ''
                                }`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-2">
                                            {booking.seat_class}
                                        </span>
                                        <h3 className="text-lg font-bold">
                                            {booking.flight?.origin.code} <span className="text-slate-400">→</span> {booking.flight?.destination.code}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(booking)}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Reference</span>
                                        <span className="font-mono font-medium">{booking.booking_reference}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Date</span>
                                        <span className="font-medium">
                                            {new Date(booking.flight?.departure_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Total Paid</span>
                                        <span className="font-bold">₹{booking.price_paid?.toFixed(2)}</span>
                                    </div>
                                    {booking.status === 'Cancelled' && booking.refund_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Refund</span>
                                            <span className="font-bold text-green-600">₹{booking.refund_amount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewInvoice(booking)}
                                        className="flex-1 flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                                    >
                                        View Invoice
                                    </button>
                                    {booking.status !== 'Cancelled' && (
                                        <button
                                            onClick={() => initiateCancel(booking)}
                                            disabled={cancellingRef === booking.booking_reference}
                                            className="flex justify-center items-center px-3 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                                            title="Cancel Booking"
                                        >
                                            {cancellingRef === booking.booking_reference ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Cancellation Modal */}
            <CancellationModal
                booking={bookingToCancel}
                onClose={() => setBookingToCancel(null)}
                onConfirm={confirmCancellation}
                loading={cancellingRef === bookingToCancel?.booking_reference}
            />

            {/* Invoice Modal */}
            {selectedBooking && selectedBooking.flight && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 print:bg-white print:p-0">
                    <div
                        ref={invoiceRef}
                        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl py-12 px-8 overflow-hidden print:shadow-none print:rounded-none"
                    >
                        <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                            <button
                                onClick={handlePrintPDF}
                                className="p-2 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={closeInvoice}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors"
                                title="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[85vh]">
                            <Invoice
                                flight={selectedBooking.flight}
                                bookingData={{
                                    seats: selectedBooking.seat_number ? [selectedBooking.seat_number] : [],
                                    passengers: [{
                                        name: selectedBooking.passenger_name,
                                        email: selectedBooking.passenger_email,
                                        seat: selectedBooking.seat_number
                                    }],
                                    totalPrice: selectedBooking.price_paid,
                                    bookingReference: selectedBooking.booking_reference,
                                    transactionId: selectedBooking.transaction_id,
                                    bookingDate: selectedBooking.booking_date,
                                }}
                                onHome={() => { }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
