import { X, Plane, Clock, Navigation, MapPin, Gauge, Mountain } from 'lucide-react';

const FlightDetailsPanel = ({ flight, onClose }) => {
    if (!flight) return null;

    const handleBackdropClick = (e) => {
        // Only close if clicking the backdrop itself, not the panel
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 z-[1000]"
                onClick={handleBackdropClick}
            />

            {/* Panel */}
            <div className="absolute top-20 right-4 sm:right-6 w-full max-w-sm bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden animate-fade-in-up z-[1001]">
                {/* Header */}
                <div className="bg-[#2E004B] text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Plane className="w-24 h-24 rotate-45" />
                    </div>

                    <button
                        onClick={handleCloseClick}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                        aria-label="Close flight details"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-secondary text-[#2E004B] text-xs font-bold uppercase tracking-wider rounded-md">
                                Live
                            </span>
                            {flight.is_my_flight && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                                    Your Flight
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-1">{flight.flight_number}</h2>
                        <p className="text-gray-300 text-sm font-light">{flight.airline || 'Hawa Hawai Airlines'}</p>
                    </div>
                </div>

                {/* Route */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#2E004B] mb-1">{flight.origin}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Origin</div>
                        </div>

                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="w-full h-0.5 bg-gray-200 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1">
                                    <Plane className="w-4 h-4 text-secondary rotate-90" />
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 mt-2">{flight.duration || '02h 45m'}</span>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#2E004B] mb-1">{flight.destination}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Dest</div>
                        </div>
                    </div>
                </div>

                {/* Telemetry */}
                <div className="p-6 grid grid-cols-2 gap-4 bg-white">
                    <TelemetryItem
                        icon={<Mountain className="w-4 h-4" />}
                        label="Altitude"
                        value={`${flight.altitude?.toLocaleString()} ft`}
                    />
                    <TelemetryItem
                        icon={<Gauge className="w-4 h-4" />}
                        label="Speed"
                        value={`${flight.speed?.toLocaleString()} kts`}
                    />
                    <TelemetryItem
                        icon={<Navigation className="w-4 h-4" />}
                        label="Heading"
                        value={`${flight.heading}°`}
                    />
                    <TelemetryItem
                        icon={<Clock className="w-4 h-4" />}
                        label="Status"
                        value={flight.live_status}
                        color="text-green-600"
                    />
                </div>

                {/* Aircraft Info */}
                <div className="bg-slate-50 p-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-slate-400">
                            <Plane />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Aircraft Type</p>
                            <p className="font-bold text-slate-700">{flight.aircraft_type}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const TelemetryItem = ({ icon, label, value, color = "text-[#2E004B]" }) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
        </div>
        <div className={`font-mono font-bold text-lg ${color}`}>{value}</div>
    </div>
);

export default FlightDetailsPanel;
