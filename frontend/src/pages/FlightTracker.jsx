import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FlightMap from '../components/FlightMap';
import { Skeleton } from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import FlightDetailsPanel from '../components/FlightDetailsPanel';
import CheckStatusModal from '../components/CheckStatusModal';
import { api, ApiError } from '../services/api';

const FlightTracker = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMyFlightsOnly, setShowMyFlightsOnly] = useState(false);
    const [selectedFlightId, setSelectedFlightId] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const fetchActiveFlights = useCallback(async () => {
        try {
            const data = await api.getActiveFlights();
            setFlights(data);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching active flights:", err);
            setError({
                message: err instanceof ApiError ? err.message : "Failed to load flight data.",
                code: err instanceof ApiError ? err.code : 'UNKNOWN_ERROR'
            });
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchActiveFlights();

        // Polling every 15 seconds as requested
        const intervalId = setInterval(fetchActiveFlights, 15000);

        return () => clearInterval(intervalId);
    }, [fetchActiveFlights]);

    // Stats
    const totalFlights = flights.length;
    const myFlights = flights.filter(f => f.is_my_flight).length;

    const filteredFlights = showMyFlightsOnly
        ? flights.filter(f => f.is_my_flight)
        : flights;

    // Memoize selected flight to avoid repeated find operations
    const selectedFlight = useMemo(() => {
        return selectedFlightId ? flights.find(f => f.id === selectedFlightId) : null;
    }, [selectedFlightId, flights]);

    return (
        <div className="h-screen flex flex-col pt-16 bg-slate-50">
            <header
                className="px-6 py-4 bg-white shadow-sm flex justify-between items-center z-10 border-b border-gray-100"
                role="banner"
            >
                <div>
                    <h1 className="text-2xl font-bold text-[#2E004B]">Live Flight Tracker</h1>
                    <p className="text-sm text-slate-500">Real-time air traffic monitoring</p>
                </div>
                <div className="flex gap-4 items-center" role="group" aria-label="Flight statistics">
                    {/* Check Status Button */}
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="px-4 py-2 bg-white text-[#2E004B] border border-[#2E004B] rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        Check Booking Status
                    </button>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowMyFlightsOnly(!showMyFlightsOnly)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showMyFlightsOnly
                            ? 'bg-[#2E004B] text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {showMyFlightsOnly ? 'Showing My Flights' : 'Show All Flights'}
                    </button>

                    <div
                        className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200"
                        aria-label={`${totalFlights} total active flights`}
                    >
                        <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Total Active
                        </span>
                        <span className="text-xl font-bold text-[#2E004B]" aria-hidden="true">
                            {loading ? <Skeleton width={30} height={24} /> : totalFlights}
                        </span>
                    </div>
                    {myFlights > 0 && (
                        <div
                            className="bg-[#FEF9C3] px-4 py-2 rounded-lg border border-[#D4AF37]"
                            aria-label={`${myFlights} of your booked flights`}
                        >
                            <span className="block text-xs font-semibold text-[#854D0E] uppercase tracking-wide">
                                My Flights
                            </span>
                            <span className="text-xl font-bold text-[#D4AF37]" aria-hidden="true">
                                {myFlights}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 relative" role="main">
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full px-4">
                        <ErrorBanner
                            message={error.message}
                            code={error.code}
                            onRetry={fetchActiveFlights}
                            onDismiss={() => setError(null)}
                        />
                    </div>
                )}

                {/* Details Panel - Premium Overlay */}
                <FlightDetailsPanel
                    flight={selectedFlight}
                    onClose={() => setSelectedFlightId(null)}
                />

                {/* Status Check Modal */}
                {showStatusModal && (
                    <CheckStatusModal onClose={() => setShowStatusModal(false)} />
                )}

                {loading ? (
                    <div
                        className="flex items-center justify-center h-full"
                        aria-label="Loading flight data"
                        role="status"
                    >
                        <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-[#2E004B] border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-slate-600">Loading flight data...</p>
                        </div>
                    </div>
                ) : (
                    <FlightMap
                        flights={filteredFlights}
                        selectedFlightId={selectedFlightId}
                        onFlightSelect={(flight) => setSelectedFlightId(flight.id)}
                    />
                )}
            </main>
        </div>
    );
};

export default FlightTracker;
