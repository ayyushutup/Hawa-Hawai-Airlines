import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { Plane, ArrowRight } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { SkeletonFlightCard } from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const [legs, setLegs] = useState([]); // Array of arrays of flights
    const [legDetails, setLegDetails] = useState([]); // Array of {origin, destination, date}
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLegs, setSelectedLegs] = useState({}); // { 0: flightObj, 1: flightObj }
    const [combinedFlight, setCombinedFlight] = useState(null);

    const type = searchParams.get('type') || 'one-way';

    const [filters, setFilters] = useState({
        min_price: '',
        max_price: '',
        stops: ''
    });

    const fetchFlights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let requests = [];
            let details = [];

            if (type === 'one-way') {
                const origin = searchParams.get('origin');
                const destination = searchParams.get('destination');
                const date = searchParams.get('date');
                requests.push(api.searchFlights(origin, destination, date, filters));
                details.push({ origin, destination, date });
            } else if (type === 'round-trip') {
                const origin = searchParams.get('origin');
                const destination = searchParams.get('destination');
                const date = searchParams.get('date');
                const returnDate = searchParams.get('returnDate');

                requests.push(api.searchFlights(origin, destination, date, filters));
                details.push({ origin, destination, date, label: 'Outbound' });

                requests.push(api.searchFlights(destination, origin, returnDate, filters));
                details.push({ origin: destination, destination: origin, date: returnDate, label: 'Return' });
            } else if (type === 'multi-city') {
                const segmentsStr = searchParams.get('segments');
                if (segmentsStr) {
                    const segments = JSON.parse(decodeURIComponent(segmentsStr));
                    segments.forEach(seg => {
                        requests.push(api.searchFlights(seg.origin, seg.destination, seg.date, filters));
                        details.push(seg);
                    });
                }
            }

            const results = await Promise.all(requests);
            setLegs(results);
            setLegDetails(details);
        } catch (err) {
            console.error(err);
            setError({
                message: err instanceof ApiError ? err.message : 'Failed to search flights. Please try again.',
                code: err instanceof ApiError ? err.code : 'UNKNOWN_ERROR'
            });
        } finally {
            setLoading(false);
        }
    }, [searchParams, type, filters]);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchFlights();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [fetchFlights]);

    const handleSelect = (legIndex, flight) => {
        setSelectedLegs(prev => ({ ...prev, [legIndex]: flight }));
    };

    const handleKeyDown = (e, legIndex, flight) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(legIndex, flight);
        }
    };

    const handleBookJourney = () => {
        const allSegments = [];
        let totalPrice = 0;

        legDetails.forEach((_, index) => {
            const flight = selectedLegs[index];
            if (flight) {
                allSegments.push(...flight.flights);
                totalPrice += flight.total_price;
            }
        });

        const combined = {
            id: 'combined-' + Date.now(),
            type: type,
            flights: allSegments,
            total_price: totalPrice,
            origin: allSegments[0].origin,
            destination: allSegments[allSegments.length - 1].destination,
            departure_time: allSegments[0].departure_time,
            arrival_time: allSegments[allSegments.length - 1].arrival_time
        };
        setCombinedFlight(combined);
    };

    const isReadyToBook = legDetails.length > 0 && Object.keys(selectedLegs).length === legDetails.length;

    // Loading state with skeleton cards
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 p-8 pb-32" role="main">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-primary">Select Flights</h1>
                    </div>
                    <div
                        className="space-y-4"
                        aria-label="Loading flight results"
                        role="status"
                    >
                        <SkeletonFlightCard />
                        <SkeletonFlightCard />
                        <SkeletonFlightCard />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 p-8 pb-32" role="main">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Error Banner */}
                {error && (
                    <ErrorBanner
                        message={error.message}
                        code={error.code}
                        onRetry={fetchFlights}
                        onDismiss={() => setError(null)}
                    />
                )}

                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-primary">Select Flights</h1>
                        {isReadyToBook && (
                            <div className="text-right">
                                <div className="text-sm text-secondary">Total Journey Price</div>
                                <div className="text-2xl font-bold text-accent">
                                    ₹{Object.values(selectedLegs).reduce((sum, f) => sum + f.total_price, 0)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <fieldset className="bg-white p-4 rounded-xl border border-secondary/10 shadow-sm flex flex-wrap gap-4 items-center">
                        <legend className="sr-only">Flight filters</legend>
                        <div className="font-semibold text-secondary text-sm">Filters:</div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="max-price" className="text-sm text-secondary">Max Price</label>
                            <input
                                id="max-price"
                                type="number"
                                placeholder="Any"
                                value={filters.max_price}
                                onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                                className="px-3 py-1.5 border border-secondary/20 rounded-lg text-sm w-28 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                aria-describedby="max-price-desc"
                            />
                            <span id="max-price-desc" className="sr-only">Enter maximum price in rupees</span>
                        </div>

                        <div className="h-4 w-px bg-secondary/20" aria-hidden="true" />

                        <div className="flex items-center gap-2">
                            <label htmlFor="stops-filter" className="text-sm text-secondary">Stops</label>
                            <select
                                id="stops-filter"
                                value={filters.stops}
                                onChange={(e) => setFilters(prev => ({ ...prev, stops: e.target.value }))}
                                className="px-3 py-1.5 border border-secondary/20 rounded-lg text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white"
                            >
                                <option value="">Any</option>
                                <option value="direct">Direct Only</option>
                                <option value="1_stop">1 Stop</option>
                            </select>
                        </div>

                        {(filters.max_price || filters.stops) && (
                            <button
                                onClick={() => setFilters({ min_price: '', max_price: '', stops: '' })}
                                className="ml-auto text-xs text-rose-500 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-300 rounded"
                                aria-label="Clear all filters"
                            >
                                Clear Filters
                            </button>
                        )}
                    </fieldset>
                </div>

                {legDetails.map((detail, legIndex) => (
                    <section key={legIndex} className="space-y-4" aria-labelledby={`leg-heading-${legIndex}`}>
                        <div
                            id={`leg-heading-${legIndex}`}
                            className="flex items-center gap-2 text-xl font-semibold text-secondary border-b border-secondary/10 pb-2"
                        >
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full" aria-hidden="true">
                                {legIndex + 1}
                            </span>
                            {detail.label || `Flight ${legIndex + 1}`}: {detail.origin}
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            {detail.destination}
                            <span className="text-sm font-normal text-secondary/60 ml-2">on {detail.date}</span>
                        </div>

                        {legs[legIndex] && legs[legIndex].length === 0 ? (
                            <div
                                className="bg-white p-6 rounded-xl border border-dashed border-secondary/30 text-center text-secondary"
                                role="status"
                            >
                                No flights found for this leg.
                            </div>
                        ) : (
                            <div role="listbox" aria-label={`Available flights for leg ${legIndex + 1}`}>
                                {legs[legIndex]?.map((itinerary, index) => {
                                    const firstFlight = itinerary.flights[0];
                                    const lastFlight = itinerary.flights[itinerary.flights.length - 1];
                                    const isDirect = itinerary.type === 'direct';
                                    const isSelected = selectedLegs[legIndex] === itinerary;

                                    return (
                                        <div
                                            key={index}
                                            role="option"
                                            aria-selected={isSelected}
                                            tabIndex={0}
                                            onClick={() => handleSelect(legIndex, itinerary)}
                                            onKeyDown={(e) => handleKeyDown(e, legIndex, itinerary)}
                                            className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all mb-4 ${isSelected
                                                ? 'bg-accent/5 border-accent ring-2 ring-accent'
                                                : 'bg-white border-secondary/10 hover:border-accent/30 hover:shadow-md focus:ring-2 focus:ring-accent focus:outline-none'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`p-4 rounded-xl ${isSelected ? 'bg-accent/10 text-accent' : 'bg-primary/5 text-primary'}`}>
                                                        <Plane className="w-8 h-8" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            {firstFlight.departure_time.split('T')[1].slice(0, 5)}
                                                        </div>
                                                        <div className="text-sm text-secondary">{firstFlight.origin.code}</div>
                                                    </div>
                                                    <div className="flex flex-col items-center px-4">
                                                        <span className="text-xs text-secondary/60">{isDirect ? 'Non-stop' : '1 Stop'}</span>
                                                        <div className="w-24 h-px bg-secondary/20 my-2 relative">
                                                            <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-secondary/30 rotate-45" aria-hidden="true" />
                                                            {!isDirect && (
                                                                <div
                                                                    className="absolute left-1/2 -top-1 w-2 h-2 bg-secondary/30 rounded-full -translate-x-1/2"
                                                                    title={`Via ${firstFlight.destination.code}`}
                                                                    aria-label={`Connecting via ${firstFlight.destination.code}`}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            {lastFlight.arrival_time.split('T')[1].slice(0, 5)}
                                                        </div>
                                                        <div className="text-sm text-secondary">{lastFlight.destination.code}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary mb-1">₹{itinerary.total_price}</div>
                                                    {isSelected && (
                                                        <div className="text-xs font-bold text-accent uppercase tracking-wider">
                                                            Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {/* Bottom Bar for Booking */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary/20 p-4 shadow-2xl">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="text-secondary" role="status" aria-live="polite">
                        {isReadyToBook ? 'All flights selected.' : `Select flight for leg ${Object.keys(selectedLegs).length + 1}...`}
                    </div>
                    <button
                        onClick={handleBookJourney}
                        disabled={!isReadyToBook}
                        className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        aria-describedby="book-status"
                    >
                        Book Journey
                    </button>
                    <span id="book-status" className="sr-only">
                        {isReadyToBook ? 'Ready to book your journey' : 'Please select all flights before booking'}
                    </span>
                </div>
            </footer>

            {combinedFlight && (
                <BookingModal
                    flight={combinedFlight}
                    onClose={() => setCombinedFlight(null)}
                />
            )}
        </div>
    );
}
