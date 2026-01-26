
import React, { useState } from 'react';
import { X, Search, AlertCircle, CheckCircle, Clock, Ban } from 'lucide-react';
import { api } from '../services/api';

const CheckStatusModal = ({ onClose }) => {
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!reference.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Re-use logic: fetch booking, which contains flight info
            const data = await api.getBooking(reference);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Could not find booking with that reference.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
            case 'on time':
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
            case 'delayed':
                return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock };
            case 'cancelled':
            case 'canceled':
                return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: Ban };
            default:
                return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: AlertCircle };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[2000] animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#2E004B] mb-2">Check Flight Status</h2>
                    <p className="text-slate-500 mb-6">Enter your Booking Reference ID to check the real-time status of your flight.</p>

                    <form onSubmit={handleCheck} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Reference ID
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                                    placeholder="e.g. ABC12345"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E004B] font-mono font-bold text-lg uppercase placeholder:normal-case"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !reference}
                            className="w-full bg-[#2E004B] text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:bg-[#1a0030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Check Status'
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-fade-in-up">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {result && result.flight && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="border-t border-dashed border-slate-200 mb-6"></div>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Flight</div>
                                    <div className="text-xl font-black text-[#2E004B]">{result.flight.flight_number}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Route</div>
                                    <div className="font-bold text-slate-700">{result.flight.origin.code} ➝ {result.flight.destination.code}</div>
                                </div>
                            </div>

                            {(() => {
                                const config = getStatusConfig(result.flight.status);
                                const StatusIcon = config.icon;
                                return (
                                    <div className={`p-4 rounded-xl border ${config.bg} ${config.border} ${config.color}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StatusIcon className="w-5 h-5" />
                                            <span className="font-bold uppercase tracking-wider">{result.flight.status}</span>
                                        </div>
                                        {result.flight.status_reason && (
                                            <p className="text-sm font-medium mt-1 pl-7 opacity-90">
                                                Reason: {result.flight.status_reason}
                                            </p>
                                        )}
                                        {!result.flight.status_reason && result.flight.status === 'Scheduled' && (
                                            <p className="text-sm mt-1 pl-7 opacity-75">
                                                On Schedule - No delays reported.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckStatusModal;
