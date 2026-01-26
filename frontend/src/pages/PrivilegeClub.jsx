import { Crown, Check, Plane, TrendingUp, Gift } from 'lucide-react';

export default function PrivilegeClub() {
    return (
        <div className="pt-20">
            {/* Hero */}
            <div className="bg-primary text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <img src="/assets/logo.png" className="w-full h-full object-contain transform translate-x-1/3" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-secondary font-bold tracking-widest uppercase mb-4 block">Loyalty Program</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Privilege Club</h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light">
                        Unlock a world of rewards. From priority boarding to exclusive lounge access,
                        your journey gets better with every mile.
                    </p>
                    <button className="mt-8 bg-secondary text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-white transition-colors">
                        Join Now
                    </button>
                </div>
            </div>

            {/* Tiers Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-bold text-primary mb-4">Membership Tiers</h2>
                    <p className="text-gray-500">Climb the ladder of luxury.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <TierCard
                        level="Silver"
                        color="bg-gray-200"
                        textColor="text-gray-800"
                        miles="0 - 25,000"
                        benefits={['Earn 10% bonus miles', 'Priority check-in', 'Extra 10kg baggage']}
                    />
                    <TierCard
                        level="Gold"
                        color="bg-yellow-100" // Subtle gold
                        textColor="text-yellow-800"
                        miles="25,000 - 75,000"
                        benefits={['Earn 50% bonus miles', 'Lounge access', 'Priority boarding', 'Free seat selection']}
                        isPopular
                    />
                    <TierCard
                        level="Platinum"
                        color="bg-slate-900"
                        textColor="text-white"
                        miles="75,000+"
                        benefits={['Earn 100% bonus miles', 'First Class Lounge access', 'Upgrade credits', 'Dedicated concierge']}
                    />
                </div>
            </div>

            {/* Miles Calculator */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-6" />
                    <h2 className="text-3xl font-display font-bold text-primary mb-8">Calculate Your Earnings</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full">
                            <label className="block text-left text-xs font-bold uppercase text-gray-400 mb-1">Route</label>
                            <select className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-primary">
                                <option>Delhi (DEL) to London (LHR)</option>
                                <option>Mumbai (BOM) to Dubai (DXB)</option>
                                <option>New York (JFK) to Paris (CDG)</option>
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-left text-xs font-bold uppercase text-gray-400 mb-1">Class</label>
                            <select className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-primary">
                                <option>Economy</option>
                                <option>Business</option>
                                <option>First Class</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <div className="text-xs font-bold uppercase text-secondary mb-1">You Earn</div>
                            <div className="text-4xl font-display font-bold text-primary">4,550 <span className="text-sm text-gray-400">Miles</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TierCard = ({ level, color, textColor, miles, benefits, isPopular }) => (
    <div className={`relative p-8 rounded-3xl ${color} ${isPopular ? 'ring-4 ring-secondary transform scale-105 shadow-2xl' : 'shadow-xl'} transition-transform hover:-translate-y-2`}>
        {isPopular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
            </div>
        )}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className={`text-3xl font-display font-bold ${textColor}`}>{level}</h3>
                <span className={`text-sm font-medium ${textColor} opacity-70`}>{miles} Miles</span>
            </div>
            <Crown className={`w-8 h-8 ${textColor}`} />
        </div>
        <ul className="space-y-4">
            {benefits.map((benefit, idx) => (
                <li key={idx} className={`flex items-center gap-3 ${textColor}`}>
                    <div className={`p-1 rounded-full ${level === 'Platinum' ? 'bg-white/20' : 'bg-black/10'}`}>
                        <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-sm">{benefit}</span>
                </li>
            ))}
        </ul>
    </div>
);
