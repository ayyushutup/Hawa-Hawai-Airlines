import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Plane, Users, Plus, Search,
    MoreVertical, Edit, Trash2, FileText, AlertCircle, CheckCircle,
    TrendingUp, Ticket, MapPin, IndianRupee
} from 'lucide-react';
import FlightFormModal from '../components/FlightFormModal';
import PassengerManifestModal from '../components/PassengerManifestModal';

const AdminDashboard = ({ embedded = false }) => {
    const [stats, setStats] = useState({
        total_bookings: 0,
        total_revenue: 0,
        active_flights: 0,
        real_bookings: 0,
        bot_bookings: 0,
        popular_route: 'N/A'
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlightModal, setShowFlightModal] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);
    const [showManifest, setShowManifest] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const fetchData = React.useCallback(async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.access_token;
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = { 'Authorization': `Bearer ${token}` };

            import { API_BASE_URL } from '../services/api';

            // ...

            const [statsRes, flightsRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/admin/flights`, { headers }),
                fetch(`${API_BASE_URL}/admin/bookings/recent`, { headers })
            ]);

            if (statsRes.status === 401 || flightsRes.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (!statsRes.ok) throw new Error(`Stats: ${statsRes.statusText}`);
            if (!flightsRes.ok) throw new Error(`Flights: ${flightsRes.statusText}`);
            if (!bookingsRes.ok) throw new Error(`Bookings: ${bookingsRes.statusText}`);

            setStats(await statsRes.json());
            setFlights(await flightsRes.json());
            const data = await bookingsRes.json();
            setRecentBookings(data.bookings || []);

        } catch (error) {
            console.error("Failed to fetch admin data", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleStatusUpdate = async (flightId, newStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.access_token;
            await fetch(`/api/admin/flights/${flightId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const filteredFlights = flights.filter(f =>
        f.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600">Loading Dashboard...</div>;

    return (
        <div className={`${embedded ? 'w-full bg-white border-t border-slate-200' : 'min-h-screen bg-gray-50'} text-slate-900 font-sans`}>
            <div className={`flex ${embedded ? 'flex-col' : 'h-screen overflow-hidden'}`}>
                {/* Sidebar - Hide if embedded */}
                {!embedded && (
                    <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col hidden md:flex shadow-sm z-10">
                        <div className="flex items-center gap-3 mb-10">
                            {/* Logo Icon */}
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                                <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <h1 className="text-xl font-bold text-primary tracking-tight">Admin Panel</h1>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'overview' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('passengers')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'passengers' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Users className="w-5 h-5" />
                                Passengers
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h2>
                            <p className="text-slate-500 text-sm">Real-time system monitoring</p>
                        </div>
                        <button
                            onClick={() => { setEditingFlight(null); setShowFlightModal(true); }}
                            className="bg-accent text-white px-4 py-2 rounded-xl font-semibold hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Flight
                        </button>
                    </header>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>Failed to load dashboard data: {error}</span>
                        </div>
                    )}

                    {activeTab === 'overview' ? (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
                                        <IndianRupee className="w-12 h-12" />
                                    </div>
                                    <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-primary">₹{stats.total_revenue?.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-800">
                                        <Ticket className="w-12 h-12" />
                                    </div>
                                    <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">Total Bookings</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total_bookings}</p>
                                    <div className="flex gap-3 mt-2 text-xs">
                                        <span className="text-emerald-600 font-medium">Real: {stats.real_bookings}</span>
                                        <span className="text-purple-600 font-medium">Bot: {stats.bot_bookings}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-600">
                                        <Plane className="w-12 h-12" />
                                    </div>
                                    <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">Active Flights</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.active_flights}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-600">
                                        <MapPin className="w-12 h-12" />
                                    </div>
                                    <p className="text-slate-500 text-sm uppercase tracking-wider mb-1">Popular Route</p>
                                    <p className="text-xl font-bold text-slate-900 truncate" title={stats.popular_route}>{stats.popular_route}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Flight Management (2/3 width) */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <Plane className="w-5 h-5 text-accent" />
                                                Flight Operations
                                            </h3>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search flights..."
                                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-48"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600">
                                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4">Flight</th>
                                                        <th className="px-6 py-4">Route</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Occupancy</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {filteredFlights.map(flight => (
                                                        <tr key={flight.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
                                                            <td className="px-6 py-4 font-mono text-primary font-medium">{flight.flight_number}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold">{flight.origin.code}</span>
                                                                    <span className="text-white/30">→</span>
                                                                    <span className="font-bold">{flight.destination.code}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold
                                                                    ${flight.status === 'Scheduled' ? 'bg-emerald-100 text-emerald-700' :
                                                                        flight.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                                                                `}>
                                                                    {flight.status === 'Scheduled' && <CheckCircle className="w-3 h-3" />}
                                                                    {flight.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary"
                                                                            style={{ width: `${(flight.bookings_count / flight.total_seats) * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-slate-500 font-medium">{flight.bookings_count}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => setShowManifest(flight.id)}
                                                                        title="View Manifest"
                                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setEditingFlight(flight); setShowFlightModal(true); }}
                                                                        title="Edit Flight"
                                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    {flight.status === 'Scheduled' && (
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(flight.id, 'Cancelled')}
                                                                            title="Cancel Flight"
                                                                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Bookings (1/3 width) */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                                        <div className="p-5 border-b border-slate-100">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                                Live Bookings
                                            </h3>
                                        </div>
                                        <div className="overflow-y-auto flex-1 max-h-[600px]">
                                            <div className="divide-y divide-slate-100">
                                                {recentBookings.map((booking, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-medium text-sm text-slate-900 truncate max-w-[150px]">
                                                                {booking.passenger_name}
                                                            </div>
                                                            <span className="text-xs font-mono text-primary font-medium">₹{booking.price_paid.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                            <span>{booking.flight_number}</span>
                                                            <span>•</span>
                                                            <span>{booking.origin} → {booking.destination}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(booking.booking_date).toLocaleTimeString()}
                                                            </span>
                                                            {booking.is_bot && (
                                                                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">
                                                                    Bot
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {recentBookings.length === 0 && (
                                                    <div className="p-8 text-center text-slate-400 text-sm">Waiting for bookings...</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                    <Users className="w-5 h-5 text-primary" />
                                    All Passengers
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Complete list of passengers across all scheduled flights.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Passenger</th>
                                            <th className="px-6 py-4">Flight Details</th>
                                            <th className="px-6 py-4">Seat / Class</th>
                                            <th className="px-6 py-4">Booking</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentBookings.map((booking, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{booking.passenger_name}</div>
                                                    <div className="text-xs text-slate-500">{booking.passenger_email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-primary">{booking.flight_number}</div>
                                                    <div className="text-xs text-slate-500">{booking.origin} → {booking.destination}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{booking.seat_class}</div>
                                                    <div className="text-xs text-slate-500">{booking.seat_number || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono font-medium text-slate-900">₹{booking.price_paid.toLocaleString()}</div>
                                                    <div className="text-xs text-slate-500">{new Date(booking.booking_date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                        ${booking.is_bot ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}
                                                    `}>
                                                        {booking.is_bot ? <span className="uppercase">Bot</span> : 'Verified'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {recentBookings.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No passengers found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showFlightModal && (
                <FlightFormModal
                    onClose={() => { setShowFlightModal(false); setEditingFlight(null); }}
                    onSuccess={fetchData}
                    initialData={editingFlight}
                />
            )}

            {showManifest && (
                <PassengerManifestModal
                    flightId={showManifest}
                    onClose={() => setShowManifest(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
