import { Luggage, Shield, Star, Info } from 'lucide-react';

export default function ExtrasSelection({ selectedExtras, onUpdateExtras }) {
    // selectedExtras example: { baggage: 20, insurance: false, priority: false }

    const BAGGAGE_OPTIONS = [
        { kg: 0, price: 0, label: 'Cabin Bag Only', desc: '7kg cabin bag included' },
        { kg: 20, price: 20, label: '20kg Checked', desc: 'Standard check-in bag' },
        { kg: 30, price: 35, label: '30kg Checked', desc: 'For heavy packers' },
        { kg: 40, price: 60, label: '40kg Checked', desc: 'Maximum allowance' }
    ];

    return (
        <div className="space-y-6">
            {/* Baggage Section */}
            <div>
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Luggage className="w-5 h-5 text-accent" />
                    Baggage Allowance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BAGGAGE_OPTIONS.map((option) => (
                        <div
                            key={option.kg}
                            onClick={() => onUpdateExtras({ ...selectedExtras, baggage: option.kg })}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedExtras.baggage === option.kg
                                ? 'bg-accent/5 border-accent ring-1 ring-accent'
                                : 'bg-white border-secondary/20 hover:border-accent/30'
                                }`}
                        >
                            <div>
                                <div className={`font-semibold ${selectedExtras.baggage === option.kg ? 'text-accent' : 'text-primary'}`}>
                                    {option.label}
                                </div>
                                <div className="text-xs text-secondary mt-0.5">{option.desc}</div>
                            </div>
                            <div className="font-bold text-primary">
                                {option.price === 0 ? 'Free' : `+$${option.price}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Services */}
            <div>
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Additional Services
                </h4>
                <div className="space-y-3">
                    {/* Travel Insurance */}
                    <div
                        onClick={() => onUpdateExtras({ ...selectedExtras, insurance: !selectedExtras.insurance })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedExtras.insurance
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-white border-secondary/20 hover:border-secondary/40'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedExtras.insurance ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-semibold text-primary">Travel Insurance</div>
                                <div className="text-xs text-secondary max-w-xs">
                                    Protect your trip against cancellation and medical emergencies.
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-primary">+$15</div>
                            <div className={`text-xs font-semibold uppercase ${selectedExtras.insurance ? 'text-emerald-600' : 'text-secondary/50'}`}>
                                {selectedExtras.insurance ? 'Added' : 'Add'}
                            </div>
                        </div>
                    </div>

                    {/* Priority Boarding */}
                    <div
                        onClick={() => onUpdateExtras({ ...selectedExtras, priority: !selectedExtras.priority })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedExtras.priority
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                            : 'bg-white border-secondary/20 hover:border-secondary/40'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedExtras.priority ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-semibold text-primary">Priority Boarding</div>
                                <div className="text-xs text-secondary">
                                    Be the first to board and secure overhead bin space.
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-primary">+$10</div>
                            <div className={`text-xs font-semibold uppercase ${selectedExtras.priority ? 'text-purple-600' : 'text-secondary/50'}`}>
                                {selectedExtras.priority ? 'Added' : 'Add'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
