import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plane, Calendar, MapPin, Search, Plus, Trash2, ArrowRightLeft, ArrowRight, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from './CustomSelect';

const RECENT_SEARCHES_KEY = 'hawa_hawai_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function FlightSearch() {
    const [airports, setAirports] = useState([]);
    const [tripType, setTripType] = useState('one-way');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [passengers] = useState(1);
    const [flightClass] = useState('economy');
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse recent searches', e);
            return [];
        }
    });

    const [segments, setSegments] = useState([
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
    ]);

    const navigate = useNavigate();

    useEffect(() => {
        api.fetchAirports()
            .then(setAirports)
            .catch(console.error);
    }, []);

    const saveRecentSearch = (searchData) => {
        const newSearch = {
            ...searchData,
            timestamp: Date.now()
        };

        // Remove duplicates and add new search at the beginning
        const filtered = recentSearches.filter(s =>
            !(s.origin === searchData.origin &&
                s.destination === searchData.destination &&
                s.date === searchData.date)
        );

        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (tripType === 'one-way') {
            if (origin && destination && date) {
                saveRecentSearch({ origin, destination, date, tripType });
                navigate(`/results?type=one-way&origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}&class=${flightClass}`);
            }
        } else if (tripType === 'round-trip') {
            if (origin && destination && date && returnDate) {
                saveRecentSearch({ origin, destination, date, returnDate, tripType });
                navigate(`/results?type=round-trip&origin=${origin}&destination=${destination}&date=${date}&returnDate=${returnDate}&passengers=${passengers}&class=${flightClass}`);
            }
        } else if (tripType === 'multi-city') {
            const segmentsApi = JSON.stringify(segments);
            saveRecentSearch({ segments, tripType });
            navigate(`/results?type=multi-city&segments=${encodeURIComponent(segmentsApi)}&passengers=${passengers}&class=${flightClass}`);
        }
    };

    const handleRecentSearchClick = (search) => {
        if (search.tripType === 'multi-city') {
            setTripType('multi-city');
            setSegments(search.segments);
        } else {
            setTripType(search.tripType);
            setOrigin(search.origin);
            setDestination(search.destination);
            setDate(search.date);
            if (search.returnDate) {
                setReturnDate(search.returnDate);
            }
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    const getAirportName = (code) => {
        const airport = airports.find(a => a.code === code);
        return airport ? airport.city : code;
    };

    const updateSegment = (index, field, value) => {
        const newSegments = [...segments];
        newSegments[index][field] = value;
        setSegments(newSegments);
    };

    const addSegment = () => {
        if (segments.length < 5) {
            setSegments([...segments, { origin: '', destination: '', date: '' }]);
        }
    };

    const removeSegment = (index) => {
        if (segments.length > 2) {
            const newSegments = segments.filter((_, i) => i !== index);
            setSegments(newSegments);
        }
    };

    const inputClasses = "w-full px-4 py-4 bg-white border border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder-gray-400 text-primary font-medium text-base h-14";

    const labelClasses = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div className="bg-white shadow-2xl border-t-4 border-secondary w-full max-w-7xl mx-auto -mt-10 sm:-mt-20 relative z-20 mx-4 sm:mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-gray-200 bg-gray-50">
                <TripTypeButton active={tripType === 'one-way'} onClick={() => setTripType('one-way')} icon={<ArrowRight className="w-4 h-4" />}>One Way</TripTypeButton>
                <TripTypeButton active={tripType === 'round-trip'} onClick={() => setTripType('round-trip')} icon={<ArrowRightLeft className="w-4 h-4" />}>Round Trip</TripTypeButton>
                <TripTypeButton active={tripType === 'multi-city'} onClick={() => setTripType('multi-city')} icon={<MapPin className="w-4 h-4" />}>Multi-City</TripTypeButton>
            </div>

            <form onSubmit={handleSearch} className="p-4 sm:p-6 lg:p-10">
                {tripType !== 'multi-city' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">

                        {/* Origin */}
                        <div className="sm:col-span-1 lg:col-span-3">
                            <CustomSelect
                                label="From"
                                placeholder="Select Origin"
                                value={origin}
                                onChange={setOrigin}
                                options={airports.map(a => ({
                                    value: a.code,
                                    label: a.city,
                                    subLabel: `${a.name} (${a.code})`
                                }))}
                                icon={MapPin}
                            />
                        </div>

                        {/* Destination */}
                        <div className="sm:col-span-1 lg:col-span-3">
                            <CustomSelect
                                label="To"
                                placeholder="Select Destination"
                                value={destination}
                                onChange={setDestination}
                                options={airports
                                    .filter(a => a.code !== origin)
                                    .map(a => ({
                                        value: a.code,
                                        label: a.city,
                                        subLabel: `${a.name} (${a.code})`
                                    }))}
                                icon={MapPin}
                            />
                        </div>

                        {/* Dates */}
                        <div className={`sm:col-span-2 ${tripType === 'round-trip' ? 'lg:col-span-4' : 'lg:col-span-3'} grid grid-cols-2 gap-3 sm:gap-4`}>
                            <div>
                                <label className={labelClasses}>Depart</label>
                                <input
                                    type="date"
                                    className={inputClasses}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            {tripType === 'round-trip' && (
                                <div>
                                    <label className={labelClasses}>Return</label>
                                    <input
                                        type="date"
                                        className={inputClasses}
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        required
                                        min={date}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <div className={`sm:col-span-2 ${tripType === 'round-trip' ? 'lg:col-span-2' : 'lg:col-span-3'} flex items-end`}>
                            <button
                                type="submit"
                                className="w-full bg-secondary hover:bg-yellow-500 text-primary font-display font-bold text-base sm:text-lg uppercase tracking-wider py-4 px-6 h-14 flex items-center justify-center gap-2 transition-all"
                            >
                                <Search className="w-5 h-5" />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center border border-gray-100 dark:border-slate-700 p-3 sm:p-4 bg-gray-50/30 dark:bg-slate-900/30">
                                <span className="sm:col-span-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Flt {idx + 1}</span>
                                <div className="sm:col-span-4">
                                    <select className={`w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-secondary outline-none py-2 font-medium dark:text-white text-sm sm:text-base`} value={seg.origin} onChange={(e) => updateSegment(idx, 'origin', e.target.value)} required>
                                        <option value="">From</option>
                                        {airports.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-4">
                                    <select className={`w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-secondary outline-none py-2 font-medium dark:text-white text-sm sm:text-base`} value={seg.destination} onChange={(e) => updateSegment(idx, 'destination', e.target.value)} required>
                                        <option value="">To</option>
                                        {airports.filter(a => a.code !== seg.origin).map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <input type="date" className={`w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-secondary outline-none py-2 font-medium dark:text-white text-sm sm:text-base`} value={seg.date} onChange={(e) => updateSegment(idx, 'date', e.target.value)} required min={idx > 0 ? segments[idx - 1].date : ''} />
                                </div>
                                <div className="sm:col-span-1 text-right">
                                    {segments.length > 2 && (
                                        <button type="button" onClick={() => removeSegment(idx)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
                            <button type="button" onClick={addSegment} disabled={segments.length >= 5} className="flex items-center justify-center gap-2 text-sm font-bold text-primary dark:text-white uppercase tracking-wider hover:text-secondary transition-colors py-3 sm:py-0">
                                <Plus className="w-4 h-4" /> Add Flight
                            </button>
                            <button type="submit" className="bg-secondary text-primary font-bold px-8 py-3 uppercase tracking-wider hover:bg-yellow-500 transition-colors">
                                Search Multi-City
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div className="border-t border-gray-100 dark:border-slate-700 px-8 lg:px-10 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recent Searches
                        </h3>
                        <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleRecentSearchClick(search)}
                                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-secondary hover:text-primary rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 transition-all flex items-center gap-2"
                            >
                                {search.tripType === 'multi-city' ? (
                                    <span>Multi-City ({search.segments?.length} flights)</span>
                                ) : (
                                    <>
                                        <span>{getAirportName(search.origin)}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span>{getAirportName(search.destination)}</span>
                                        {search.tripType === 'round-trip' && <ArrowRightLeft className="w-3 h-3 text-accent" />}
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const TripTypeButton = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        type="button"
        className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest transition-all ${active
            ? 'bg-white text-primary border-t-2 border-secondary -mt-0.5'
            : 'text-gray-400 hover:text-primary hover:bg-gray-100'
            }`}
    >
        <span className="hidden sm:inline">{icon}</span>
        {children}
    </button>
);
