import React, { useState, useEffect } from 'react';
import { X, Calendar, Plane, MapPin, DollarSign } from 'lucide-react';

const FlightFormModal = ({ onClose, onSuccess, initialData = null }) => {
    const [formData, setFormData] = useState({
        flight_number: '',
        origin_code: '',
        destination_code: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        aircraft_type: 'Boeing 737',
        total_seats: 180
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                departure_time: initialData.departure_time.slice(0, 16), // Format for datetime-local
                arrival_time: initialData.arrival_time.slice(0, 16)
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const url = initialData
                ? `/api/admin/flights/${initialData.id}`
                : '/api/admin/flights';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save flight');

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-secondary/10 flex items-center justify-between bg-white">
                    <h3 className="text-xl font-bold text-primary">
                        {initialData ? 'Edit Flight' : 'Add New Flight'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-secondary/40" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Flight Number</label>
                            <input
                                type="text"
                                name="flight_number"
                                required
                                placeholder="HH101"
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.flight_number}
                                onChange={handleChange}
                                disabled={!!initialData}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Aircraft</label>
                            <input
                                type="text"
                                name="aircraft_type"
                                required
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.aircraft_type}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Origin</label>
                            <input
                                type="text"
                                name="origin_code"
                                required
                                maxLength="3"
                                placeholder="DEL"
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none uppercase"
                                value={formData.origin_code}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Destination</label>
                            <input
                                type="text"
                                name="destination_code"
                                required
                                maxLength="3"
                                placeholder="BOM"
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none uppercase"
                                value={formData.destination_code}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Departure</label>
                            <input
                                type="datetime-local"
                                name="departure_time"
                                required
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.departure_time}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Arrival</label>
                            <input
                                type="datetime-local"
                                name="arrival_time"
                                required
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.arrival_time}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary uppercase">Total Seats</label>
                            <input
                                type="number"
                                name="total_seats"
                                required
                                min="10"
                                className="w-full px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-xl focus:border-accent outline-none"
                                value={formData.total_seats}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-secondary/20 text-primary font-semibold rounded-xl hover:bg-secondary/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent/90 transition-all disabled:opacity-50 shadow-lg shadow-accent/30"
                        >
                            {loading ? 'Saving...' : 'Save Flight'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlightFormModal;
