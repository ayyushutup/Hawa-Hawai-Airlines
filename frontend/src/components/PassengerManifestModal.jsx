import React, { useState, useEffect } from 'react';
import { X, User, Mail, Armchair, Utensils } from 'lucide-react';

const PassengerManifestModal = ({ flightId, onClose }) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/admin/flights/${flightId}/manifest`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPassengers(data);
                }
            } catch (error) {
                console.error("Error fetching manifest:", error);
            } finally {
                setLoading(false);
            }
        };

        if (flightId) fetchManifest();
    }, [flightId]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-secondary/10 flex items-center justify-between bg-white shrink-0">
                    <h3 className="text-xl font-bold text-primary">Passenger Manifest</h3>
                    <button onClick={onClose} className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-secondary/40" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-10 text-secondary">Loading passengers...</div>
                    ) : passengers.length === 0 ? (
                        <div className="text-center py-10 text-secondary/60">No passengers found for this flight.</div>
                    ) : (
                        <div className="space-y-3">
                            {passengers.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-primary">{p.passenger_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-secondary/60">
                                                <Mail className="w-3 h-3" />
                                                {p.passenger_email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-secondary/10 rounded-lg text-xs font-medium text-secondary">
                                            <Armchair className="w-3 h-3" />
                                            {p.seat_number || 'No Seat'} ({p.seat_class})
                                        </div>
                                        {p.meal_preference && (
                                            <div className="flex items-center justify-end gap-1 text-xs text-secondary/60">
                                                <Utensils className="w-3 h-3" />
                                                {JSON.parse(p.meal_preference).name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PassengerManifestModal;
