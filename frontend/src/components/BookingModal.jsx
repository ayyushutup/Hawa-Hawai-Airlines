import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Tag, CreditCard, Briefcase, Star, Armchair, ChevronDown } from 'lucide-react';
import SeatMap from './SeatMap';
import MealSelection from './MealSelection';
import ExtrasSelection from './ExtrasSelection';
import Invoice from './Invoice';

const CLASS_MULTIPLIERS = {
    'Economy': 1,
    'Business': 2.5,
    'First Class': 4
};

const CLASS_FEATURES = {
    'Economy': {
        color: 'bg-slate-100 text-slate-700',
        luggage: '1 x 23kg Check-in',
        cabin: '7kg Cabin',
        seat: 'Standard Legroom',
        perks: ['Standard Meal', 'USB Charger']
    },
    'Business': {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        luggage: '2 x 23kg Check-in',
        cabin: '10kg (2 bags) Cabin',
        seat: 'Extra Legroom (34") & Recline',
        perks: ['Priority Boarding', 'Gourmet Dining', 'Lounge Access']
    },
    'First Class': {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        luggage: '3 x 32kg Check-in',
        cabin: '15kg (Unlimited) Cabin',
        seat: 'Full Flat-bed Private Suite',
        perks: ['Chauffeur Service', 'Champagne on Arrival', 'Exclusive Menu']
    }
};

export default function BookingModal({ flight, onClose }) {
    const [step, setStep] = useState(1);

    // Multi-passenger state
    const [passengers, setPassengers] = useState([
        { id: 1, name: '', email: '', seatClass: 'Economy', seat: null, meal: null }
    ]);

    const [extras, setExtras] = useState({ baggage: 0, insurance: false, priority: false });
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [bookingData, setBookingData] = useState(null);

    // Payment Form
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Promo & Pricing
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    const [pricingDetails, setPricingDetails] = useState({
        basePrice: 0,
        mealPrice: 0,
        extrasPrice: 0,
        taxes: 0,
        discount: 0,
        total: 0,
        subtotal_gross: 0
    });

    const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0); // For seat/meal selection steps

    // Calculate Price Effect
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Calculate totals based on all passengers
                // We'll calculate "per person" typical costs based on first passenger or average
                // For simplicity, we send general params to backend API which returns per-person breakdown
                // check backend implementation: it accepts single seat_class, meal_price, etc.
                // If passengers have mixed classes, we might need to calc client side or sum up API calls?
                // Backend `calculate_booking_breakdown` takes one seat_class.
                // Let's assume for this MVP all passengers share the class or we use the first one for estimation.
                // Or better: We sum it up here if classes differ.

                // Simplified: All passengers usually travel same class in same booking flow,
                // or we loop. Let's assume same class for now or use the first passenger's class for the base calc.

                const mainPassenger = passengers[0];
                const mealPriceTotal = passengers.reduce((sum, p) => sum + (p.meal?.price || 0), 0);

                const details = await api.calculatePrice({
                    flight_id: flight.flights[0].id,
                    seat_class: mainPassenger.seatClass, // Using first passenger's class as reference
                    meal_price: mealPriceTotal / passengers.length, // Avg meal price
                    baggage_kg: extras.baggage,
                    has_insurance: extras.insurance,
                    has_priority: extras.priority,
                    passenger_count: passengers.length,
                    promo_code: appliedPromo ? appliedPromo.code : null
                });

                setPricingDetails({
                    basePrice: details.seat_price_per_person * passengers.length, // Total base
                    mealPrice: details.meal_price_per_person * passengers.length,
                    extrasPrice: details.extras_price_per_person * passengers.length,
                    taxes: details.taxes,
                    discount: details.discount_amount,
                    total: details.total_price,
                    subtotal_gross: details.subtotal_gross
                });
            } catch (err) {
                console.error("Failed to calculate price", err);
            }
        };
        fetchPrice();
    }, [passengers, extras, flight, appliedPromo]);

    const handleAddPassenger = () => {
        setPassengers([...passengers, {
            id: passengers.length + 1,
            name: '',
            email: '',
            seatClass: 'Economy',
            seat: null,
            meal: null
        }]);
    };

    const handleRemovePassenger = (index) => {
        if (passengers.length > 1) {
            const newPassengers = [...passengers];
            newPassengers.splice(index, 1);
            setPassengers(newPassengers);
        }
    };

    const updatePassenger = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], [field]: value };
        setPassengers(newPassengers);
    };

    // Auto-select insurance for premium classes
    useEffect(() => {
        if (passengers.length > 0) {
            const mainClass = passengers[0].seatClass;
            if (mainClass === 'Business' || mainClass === 'First Class') {
                setExtras(prev => ({ ...prev, insurance: true }));
            }
        }
    }, [passengers]);

    const handleApplyPromo = async () => {
        setPromoError('');
        if (!promoCode) return;

        try {
            // We can just rely on calculatePrice to validate,/return discount
            // But let's verify if we want specific feedback
            const res = await api.validatePromo(promoCode);
            if (res.valid) {
                setAppliedPromo(res);
                setPromoError('');
            } else {
                setAppliedPromo(null);
                setPromoError(res.error || 'Invalid Code');
            }
        } catch (e) {
            setPromoError('Failed to validate code');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const flightsToBook = flight.flights;
            const allBookings = [];

            // Loop through each passenger and book
            for (const passenger of passengers) {
                const results = await Promise.all(flightsToBook.map((f, index) => api.createBooking({
                    flight_id: f.id,
                    passenger_name: passenger.name || 'Guest',
                    passenger_email: passenger.email || 'guest@example.com',
                    seat_class: passenger.seatClass,
                    seat_number: (index === 0 && passenger.seat) ? passenger.seat : null,
                    meal_preference: passenger.meal?.name || null,
                    meal_price: passenger.meal?.price || 0,
                    baggage_kg: extras.baggage,
                    has_insurance: extras.insurance,
                    has_priority: extras.priority,
                    payment_method: paymentMethod,
                    promo_code: appliedPromo ? appliedPromo.code : null
                })));
                allBookings.push(...results);
            }

            setBookingData(allBookings);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            let msg = err.message || 'Failed to book flights';
            if (err.details) {
                if (typeof err.details === 'object' && !Array.isArray(err.details)) {
                    const detailStr = Object.entries(err.details)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join(' | ');
                    msg += ` (${detailStr})`;
                } else {
                    msg += ` (${JSON.stringify(err.details)})`;
                }
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success && bookingData) return (
        <Invoice
            bookings={Array.isArray(bookingData) ? bookingData : [bookingData]}
            flights={flight.flights}
            onClose={onClose}
        />
    );

    const firstSegment = flight.flights[0];

    const renderStepContent = () => {
        switch (step) {
            case 1: // Passengers
                return (
                    <div className="space-y-6 animate-fade-in max-h-[60vh] overflow-y-auto pr-2">
                        {passengers.map((passenger, index) => (
                            <div key={passenger.id} className="p-4 border border-secondary/20 rounded-xl bg-slate-50 relative">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-primary">Passenger {index + 1}</span>
                                    {passengers.length > 1 && (
                                        <button onClick={() => handleRemovePassenger(index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-medium text-secondary mb-1 block">Full Name</label>
                                        <input
                                            value={passenger.name}
                                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-secondary/20 rounded-lg outline-none focus:border-accent"
                                            placeholder="Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-secondary mb-1 block">Email</label>
                                        <input
                                            value={passenger.email}
                                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-secondary/20 rounded-lg outline-none focus:border-accent"
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-secondary mb-1 block">Class Selection</label>
                                    <div className="flex gap-2 mb-3">
                                        {Object.keys(CLASS_MULTIPLIERS).map((cls) => (
                                            <button
                                                key={cls}
                                                onClick={() => updatePassenger(index, 'seatClass', cls)}
                                                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all ${passenger.seatClass === cls
                                                    ? 'bg-accent/10 border-accent text-accent'
                                                    : 'bg-white border-secondary/20 text-secondary'
                                                    }`}
                                            >
                                                {cls}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Class Features Card */}
                                    <div className={`p-3 rounded-lg border text-xs space-y-2 ${CLASS_FEATURES[passenger.seatClass].color}`}>
                                        <div className="flex items-center gap-2 font-bold">
                                            <Star className="w-3 h-3" />
                                            {passenger.seatClass} Benefits
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="w-3 h-3 opacity-70" />
                                                <span>{CLASS_FEATURES[passenger.seatClass].luggage}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="w-3 h-3 opacity-70 transform rotate-90" />
                                                <span>{CLASS_FEATURES[passenger.seatClass].cabin}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Armchair className="w-3 h-3 opacity-70" />
                                                <span>{CLASS_FEATURES[passenger.seatClass].seat}</span>
                                            </div>
                                            <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                                                {CLASS_FEATURES[passenger.seatClass].perks.map(perk => (
                                                    <span key={perk} className="px-1.5 py-0.5 bg-white/60 rounded-sm border border-black/5">
                                                        {perk}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleAddPassenger}
                            className="w-full py-3 border-2 border-dashed border-secondary/30 rounded-xl text-secondary font-medium hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Another Passenger
                        </button>
                    </div>
                );
            case 2: // Seats (Looping)
                const pSeat = passengers[currentPassengerIndex];
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-primary">
                                Seat for <span className="text-accent">{pSeat.name || `Passenger ${currentPassengerIndex + 1}`}</span>
                            </h4>
                            <div className="flex gap-2 text-sm">
                                <button onClick={() => updatePassenger(currentPassengerIndex, 'seat', null)} className="text-slate-400 hover:text-slate-600">Skip</button>
                            </div>
                        </div>
                        <SeatMap
                            flightId={firstSegment.id}
                            selectedSeat={pSeat.seat}
                            onSelectSeat={(seat) => updatePassenger(currentPassengerIndex, 'seat', seat)}
                        />
                        <div className="flex justify-between mt-4">
                            <div className="text-xs text-slate-500">Passenger {currentPassengerIndex + 1} of {passengers.length}</div>
                            {passengers.length > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPassengerIndex === 0}
                                        onClick={() => setCurrentPassengerIndex(i => i - 1)}
                                        className="px-3 py-1 bg-slate-100 rounded text-xs disabled:opacity-50"
                                    >Prev</button>
                                    <button
                                        disabled={currentPassengerIndex === passengers.length - 1}
                                        onClick={() => setCurrentPassengerIndex(i => i + 1)}
                                        className="px-3 py-1 bg-slate-100 rounded text-xs disabled:opacity-50"
                                    >Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 3: // Meals (Looping)
                const pMeal = passengers[currentPassengerIndex];
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-primary">
                                Meal for <span className="text-accent">{pMeal.name || `Passenger ${currentPassengerIndex + 1}`}</span>
                            </h4>
                            <button onClick={() => updatePassenger(currentPassengerIndex, 'meal', null)} className="text-xs text-slate-400 hover:text-slate-600">Skip Meal</button>
                        </div>
                        <MealSelection
                            selectedMeal={pMeal.meal}
                            onSelectMeal={(meal) => updatePassenger(currentPassengerIndex, 'meal', meal)}
                        />
                        <div className="flex justify-between mt-4">
                            <div className="text-xs text-slate-500">Passenger {currentPassengerIndex + 1} of {passengers.length}</div>
                            {passengers.length > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPassengerIndex === 0}
                                        onClick={() => setCurrentPassengerIndex(i => i - 1)}
                                        className="px-3 py-1 bg-slate-100 rounded text-xs disabled:opacity-50"
                                    >Prev</button>
                                    <button
                                        disabled={currentPassengerIndex === passengers.length - 1}
                                        onClick={() => setCurrentPassengerIndex(i => i + 1)}
                                        className="px-3 py-1 bg-slate-100 rounded text-xs disabled:opacity-50"
                                    >Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4: // Extras (Global for now)
                return (
                    <div className="animate-fade-in">
                        <h4 className="font-semibold text-primary mb-4">Add Extras (Applied to all)</h4>
                        <ExtrasSelection
                            selectedExtras={extras}
                            onUpdateExtras={setExtras}
                        />
                    </div>
                );
            case 5: // Review & Pay (Enhanced)
                // Hawa Miles Calculation (10% of total price as points)
                const miles = Math.floor(pricingDetails.total / 10);

                // Donut Chart Data
                const total = pricingDetails.total;
                const basePct = (pricingDetails.basePrice / total) * 100;
                const taxPct = (pricingDetails.taxes / total) * 100;
                const extraPct = ((pricingDetails.extrasPrice + pricingDetails.mealPrice) / total) * 100;
                // Simplified for visual

                return (
                    <div className="animate-fade-in space-y-4">
                        <h4 className="font-semibold text-primary mb-2">Review & Apply Discounts</h4>

                        {/* Promo Code Section */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Enter Promo Code"
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:border-accent"
                                />
                            </div>
                            <button
                                onClick={handleApplyPromo}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700"
                            >
                                Apply
                            </button>
                        </div>
                        {appliedPromo && (
                            <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2 mb-2">
                                <Check className="w-3 h-3" /> Code <b>{appliedPromo.code}</b> applied!
                            </div>
                        )}
                        {promoError && (
                            <div className="text-rose-500 text-xs px-1 mb-2">
                                {promoError}
                            </div>
                        )}

                        {/* Price Breakdown Visual */}
                        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex items-center gap-6">
                            {/* CSS Conic Gradient Donut */}
                            <div className="relative w-16 h-16 rounded-full flex-shrink-0" style={{
                                background: `conic-gradient(
                                    #2E004B 0% ${basePct}%,
                                    #D4AF37 ${basePct}% ${basePct + extraPct}%,
                                    #94a3b8 ${basePct + extraPct}% 100%
                                )`
                            }}>
                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-400">Total</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#2E004B]"></div> Base Fare</div>
                                    <span className="font-medium">₹{pricingDetails.basePrice.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div> Extras & Meals</div>
                                    <span className="font-medium">₹{(pricingDetails.extrasPrice + pricingDetails.mealPrice).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Taxes</div>
                                    <span className="font-medium">₹{pricingDetails.taxes.toFixed(0)}</span>
                                </div>
                                {pricingDetails.discount > 0 && (
                                    <div className="flex justify-between text-xs text-green-600 font-bold border-t border-dashed border-slate-200 pt-1 mt-1">
                                        <span>Discount</span>
                                        <span>- ₹{pricingDetails.discount.toFixed(0)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hawa Miles */}
                        <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xl">💎</div>
                            <div>
                                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Loyalty Rewards</p>
                                <p className="text-sm text-purple-900 font-bold">You will earn {miles} Hawa Miles</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg mt-4">
                            <span className="text-slate-300">Total Amount</span>
                            <span className="text-2xl font-bold">₹{pricingDetails.total.toFixed(0)}</span>
                        </div>
                    </div>
                );
            case 6: // Payment Form (Same as before)
                return (
                    <div className="animate-fade-in space-y-6">
                        <h4 className="font-semibold text-primary">Payment Details</h4>
                        <div className="space-y-4">
                            <div className="p-4 border rounded-xl bg-slate-50 flex gap-4 items-center">
                                <CreditCard className="w-6 h-6 text-slate-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Credit / Debit Card</p>
                                </div>
                                <div className="h-4 w-4 rounded-full border-2 border-accent bg-accent"></div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Card Number</label>
                                <input
                                    value={cardNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                        setCardNumber(formatted);
                                    }}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-secondary">Expiry</label>
                                    <input
                                        value={expiryDate}
                                        onChange={(e) => {
                                            // Strictly MM / YY format
                                            let val = e.target.value.replace(/\D/g, ''); // Remove non-digit
                                            if (val.length >= 2) {
                                                // MM / YY
                                                val = val.slice(0, 2) + ' / ' + val.slice(2, 4);
                                            }
                                            setExpiryDate(val);
                                        }}
                                        maxLength={7}
                                        placeholder="MM / YY"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary">CVV</label>
                                    <input
                                        type="password"
                                        value={cvv}
                                        onChange={(e) => {
                                            // Strictly 3 digits
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                            setCvv(val);
                                        }}
                                        maxLength={3}
                                        placeholder="123"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-secondary">Name on Card</label>
                                <input value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" />
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`bg-white rounded-2xl w-full ${step >= 2 && step <= 4 ? 'max-w-2xl' : 'max-w-md'} overflow-hidden shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col`}>
                <div className="p-6 border-b border-secondary/10 flex items-center justify-between bg-white flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-primary">
                            {step === 1 && 'Passenger Details'}
                            {step === 2 && 'Select Seats'}
                            {step === 3 && 'Select Meals'}
                            {step === 4 && 'Add Extras'}
                            {step === 5 && 'Confirmation'}
                            {step === 6 && 'Payment'}
                        </h3>
                        <p className="text-sm text-secondary">Step {step} of 6</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-secondary/40" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error}</div>}

                    {renderStepContent()}

                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                onClick={() => {
                                    if (step === 2 || step === 3) {
                                        // Reset passenger index when going back? Or keep it?
                                        // Simple behavior: just go back step
                                        setCurrentPassengerIndex(0);
                                    }
                                    setStep(s => s - 1);
                                }}
                                className="flex-1 py-3 border border-secondary/20 text-primary font-semibold rounded-xl hover:bg-secondary/5 transition-all"
                            >
                                Back
                            </button>
                        )}

                        {step < 6 ? (
                            <button
                                onClick={() => {
                                    // Validation
                                    if (step === 1) {
                                        const invalid = passengers.some(p => !p.name || !p.email);
                                        if (invalid) { setError('Please fill all passenger details'); return; }
                                    }
                                    setError('');
                                    setStep(s => s + 1);
                                    setCurrentPassengerIndex(0); // Reset index for next step loops
                                }}
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {step === 5 ? 'Proceed to Payment' : 'Next Step'} <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30"
                            >
                                {loading ? 'Processing...' : `Pay ₹${pricingDetails.total.toFixed(0)}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
