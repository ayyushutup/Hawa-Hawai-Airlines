import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, CheckCircle, Plane } from 'lucide-react';

export default function Invoice({ booking, bookings, flight, flights, onClose }) {
    const invoiceRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    const allBookings = bookings || (booking ? [booking] : []);
    const allFlights = flights || (flight ? [flight] : []);

    if (allBookings.length === 0 || allFlights.length === 0) return null;

    return createPortal(
        <>
            <style>
                {`
                    @media print {
                        body > *:not(.invoice-portal-container) {
                            display: none !important;
                        }
                        .invoice-portal-container {
                            display: block !important;
                            position: static !important;
                            width: 100% !important;
                            height: auto !important;
                            z-index: 9999 !important;
                            background: white !important;
                            overflow: visible !important;
                        }
                        .invoice-portal-container > div {
                            box-shadow: none !important;
                            max-width: none !important;
                            width: 100% !important;
                            max-height: none !important;
                            overflow: visible !important;
                            border-radius: 0 !important;
                        }
                        /* Ensure content inside prints correctly */
                        .invoice-portal-container * {
                            visibility: visible !important;
                        }
                        @page {
                            margin: 0.5cm;
                            size: auto;
                        }
                    }
                `}
            </style>
            <div className="invoice-portal-container fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
                <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:w-full print:rounded-none print:max-h-none print:overflow-visible">

                    {/* Header Actions - Hidden in Print */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="font-semibold">Booking Confirmed ({allBookings.length} Flights)</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" /> Print / Save PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content - Scrollable */}
                    <div ref={invoiceRef} className="p-10 print:p-8 space-y-12 text-slate-800 overflow-y-auto print:overflow-visible">

                        {allBookings.map((bk, index) => {
                            const flt = allFlights[index] || allFlights[0]; // Fallback
                            const totalPaid = bk.price_paid || 0;
                            let formattedDate = 'Date not available';
                            try {
                                if (bk.booking_date) {
                                    formattedDate = new Date(bk.booking_date).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    });
                                }
                            } catch (e) {
                                console.error("Date error", e);
                            }

                            return (
                                <div key={index} className="space-y-8 print:break-inside-avoid print:mb-16">
                                    {/* Branding Header */}
                                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden print:print-color-adjust-exact border-2 border-slate-100">
                                                <img src="/assets/logo.png" alt="Hawa Hawai Logo" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Hawa Hawai</h1>
                                                <p className="text-slate-500 text-sm font-medium tracking-wide">AIRLINES</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-3xl font-black text-slate-200 tracking-widest uppercase print:text-slate-300">E-Ticket {index + 1}</h2>
                                            <p className="text-sky-600 font-mono font-bold text-lg mt-1">{bk.booking_reference}</p>
                                        </div>
                                    </div>

                                    {/* Flight Access Pass Style Header */}
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between print:bg-slate-50 print:border-slate-200 print:print-color-adjust-exact">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-slate-900">{flt.origin.code}</div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{flt.origin.city}</div>
                                        </div>

                                        <div className="flex-1 px-8 flex flex-col items-center">
                                            <div className="text-xs font-bold text-slate-400 mb-2">{flt.flight_number}</div>
                                            <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                                                <div className="absolute w-2 h-2 rounded-full bg-sky-500 left-0"></div>
                                                <Plane className="w-5 h-5 text-sky-500 transform rotate-90 absolute" />
                                                <div className="absolute w-2 h-2 rounded-full bg-slate-300 right-0"></div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 mt-2">{formattedDate}</div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-4xl font-black text-slate-900">{flt.destination.code}</div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{flt.destination.city}</div>
                                        </div>
                                    </div>

                                    {/* Grid details */}
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passenger details</h3>
                                            <div className="border-l-4 border-sky-500 pl-4 py-1">
                                                <p className="text-lg font-bold text-slate-900">{bk.passenger_name}</p>
                                                <p className="text-sm text-slate-500">{bk.passenger_email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Class</h3>
                                                <p className="font-semibold text-slate-900">{bk.seat_class}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seat</h3>
                                                <p className="font-semibold text-slate-900">{bk.seat_number || 'Gate Check'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Departs</h3>
                                                <p className="font-semibold text-slate-900">{flt.departure_time.split('T')[1].slice(0, 5)}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Arrives</h3>
                                                <p className="font-semibold text-slate-900">{flt.arrival_time.split('T')[1].slice(0, 5)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Breakdown */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Payment Breakdown</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Airfare ({bk.seat_class})</span>
                                                <span className="font-medium text-slate-900">₹{(bk.price_paid - (bk.meal_price || 0) - (bk.extras_price || 0)).toFixed(2)}</span>
                                            </div>
                                            {bk.meal_price > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Meal ({bk.meal_preference})</span>
                                                    <span className="font-medium text-slate-900">₹{bk.meal_price.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {bk.extras_price > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        Extras ({bk.baggage_kg > 0 ? `${bk.baggage_kg}kg Bag` : ''}
                                                        {[bk.has_insurance && 'Insurance', bk.has_priority && 'Priority']
                                                            .filter(Boolean).map(e => (bk.baggage_kg > 0 ? ', ' : '') + e).join(', ')})
                                                    </span>
                                                    <span className="font-medium text-slate-900">₹{bk.extras_price.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-3">
                                                <span className="font-bold text-slate-900">Total Paid</span>
                                                <span className="text-2xl font-bold text-sky-600">₹{totalPaid.toFixed(2)}</span>
                                            </div>
                                            <div className="text-right text-xs text-slate-400 mt-1">
                                                Paid via {bk.payment_method || 'Card'} • {bk.transaction_id || 'ID Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    {index < allBookings.length - 1 && <div className="border-b-2 border-dashed border-slate-200"></div>}
                                </div>
                            );
                        })}

                        {/* Footer / Barcode */}
                        <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col items-center justify-center gap-4">
                            <div className="flex items-end gap-1 h-12 opacity-40">
                                {/* Mock Barcode visual */}
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className={`w-${Math.random() > 0.5 ? '1' : '1.5'} h-full bg-black`} style={{ opacity: Math.random() * 0.5 + 0.5 }}></div>
                                ))}
                            </div>
                            <p className="text-xs text-center text-slate-400 max-w-sm">
                                Hawa Hawai Airlines • Use Reference IDs above for check-in.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
