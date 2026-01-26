import { X, MapPin, ArrowRight, Filter } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DESTINATIONS = [
    {
        id: 'paris',
        city: 'Paris',
        country: 'France',
        price: '₹45,999',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
        tags: ['Romance', 'City'],
        desc: 'The city of lights and love.'
    },
    {
        id: 'maldives',
        city: 'Maldives',
        country: 'Maldives',
        price: '₹25,999',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
        tags: ['Beach', 'Relaxation'],
        desc: 'Crystal clear waters await.'
    },
    {
        id: 'tokyo',
        city: 'Tokyo',
        country: 'Japan',
        price: '₹55,999',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
        tags: ['City', 'Culture'],
        desc: 'Where tradition meets future.'
    },
    {
        id: 'swiss',
        city: 'Zermatt',
        country: 'Switzerland',
        price: '₹65,999',
        image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800&auto=format&fit=crop',
        tags: ['Mountains', 'Adventure'],
        desc: 'Peak alpine perfection.'
    },
    {
        id: 'dubai',
        city: 'Dubai',
        country: 'UAE',
        price: '₹18,999',
        image: '/assets/experience/dubai_premium.png',
        tags: ['Luxury', 'City'],
        desc: 'The jewel of the desert.'
    },
    {
        id: 'santorini',
        city: 'Santorini',
        country: 'Greece',
        price: '₹42,999',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop',
        tags: ['Beach', 'Romance'],
        desc: 'Blue domes and sunsets.'
    }
];

const CATEGORIES = ['All', 'Beach', 'City', 'Mountains', 'Romance', 'Luxury'];

export default function DestinationsModal({ isOpen, onClose }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const filteredDestinations = activeFilter === 'All'
        ? DESTINATIONS
        : DESTINATIONS.filter(d => d.tags.includes(activeFilter));

    const handleSelect = (city) => {
        // In a real app, this would pre-fill the search form
        // For now, we'll just close and navigate to results to simulate flow
        onClose();
        navigate('/results?destination=' + city);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary/95 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-7xl h-[85vh] bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">

                {/* Header */}
                <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/20">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">Discover Your Next Journey</h2>
                        <p className="text-gray-400">Hand-picked destinations for the discerning traveler.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeFilter === cat
                                    ? 'bg-secondary text-primary transform scale-105 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDestinations.map((dest) => (
                            <div
                                key={dest.id}
                                onClick={() => handleSelect(dest.city)}
                                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/5"
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.city}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <div className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {dest.country}
                                            </div>
                                            <h3 className="text-3xl font-display font-bold text-white mb-1">{dest.city}</h3>
                                            <p className="text-gray-300 text-sm line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{dest.desc}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-gray-400 text-xs uppercase font-bold">From</div>
                                            <div className="text-xl font-bold text-white">{dest.price}</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                                        <div className="w-0 h-full bg-secondary group-hover:w-full transition-all duration-700 ease-out" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
