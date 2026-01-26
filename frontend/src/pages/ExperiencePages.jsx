import { ArrowRight, Utensils, Armchair, Wine } from 'lucide-react';

export const CabinExperience = () => (
    <div className="pt-20">
        <HeroSection
            title="Sanctuary in the Sky"
            subtitle="Explore our world-class cabins designed for your ultimate comfort."
            image="/assets/features/virtual_cabin.png"
        />
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-display font-bold text-primary mb-6">First Class Suites</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        Experience the epitome of luxury in our private suites. Featuring sliding doors for complete privacy,
                        a personal wardrobe, and a 32-inch 4K screen. Your seat transforms into a fully flat bed with
                        hotel-quality bedding for a restful sleep.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <FeatureItem text="Fully enclosed private suites" />
                        <FeatureItem text="A la carte dining on demand" />
                        <FeatureItem text="Bvlgari amenity kits" />
                        <FeatureItem text="Unlimited high-speed Wi-Fi" />
                    </ul>
                </div>
                <div className="bg-gray-100 rounded-2xl h-[400px] overflow-hidden shadow-2xl">
                    {/* Placeholder for 3D viewer or image carousel */}
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        <span className="font-bold text-xl uppercase tracking-widest">Interactive 3D Suite View Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const DiningExperience = () => (
    <div className="pt-20">
        <HeroSection
            title="A Global Culinary Journey"
            subtitle="Savor exquisite flavors curated by world-renowned chefs."
            image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1920&auto=format&fit=crop"
        />
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <Utensils className="w-12 h-12 text-secondary mx-auto mb-6" />
                <h2 className="text-4xl font-display font-bold text-primary mb-4">Farm to Flight</h2>
                <p className="text-gray-600 text-lg">
                    We believe fresh ingredients make the best meals. Our menus change seasonally
                    and highlight the local flavors of your destination.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <MenuCard
                    title="Royal Indian Thali"
                    desc="A selection of regional curries, saffron rice, and warm naan."
                    image="/assets/experience/dining_thali.png"
                />
                <MenuCard
                    title="Modern European"
                    desc="Pan-seared salmon with asparagus and lemon butter sauce."
                    image="/assets/experience/dining_salmon.png"
                />
                <MenuCard
                    title="Vegan Delight"
                    desc="Quinoa bowl with roasted vegetables and tahini dressing."
                    image="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
                />
            </div>
        </div>
    </div>
);

export const LoungeExperience = () => (
    <div className="pt-20">
        <HeroSection
            title="The Hawa Hawai Lounge"
            subtitle="Your oasis of calm before the journey begins."
            image="/assets/experience/lounge_hero.png"
        />
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-4xl font-display font-bold text-primary mb-6">Designed for Relaxation</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        Escape the bustle of the terminal in our exclusive lounges. Enjoy a refreshing shower,
                        catch up on work with high-speed Wi-Fi, or simply unwind with a signature cocktail
                        at our marble bar.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <FeatureCard icon={<Armchair />} title="Comfort Seating" />
                        <FeatureCard icon={<Utensils />} title="Buffet & A la Carte" />
                        <FeatureCard icon={<Wine />} title="Premium Bar" />
                        <FeatureCard icon={<ArrowRight />} title="Fast Track Boarding" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <img src="/assets/experience/lounge_spa.png" alt="Luxury Shower Spa" className="rounded-2xl shadow-lg mt-8 object-cover h-64 w-full" />
                    <img src="/assets/experience/lounge_pod.png" alt="Private Nap Pod" className="rounded-2xl shadow-lg object-cover h-64 w-full" />
                </div>
            </div>
        </div>
    </div>
);

// Helper Components
const HeroSection = ({ title, subtitle, image }) => (
    <div className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-4xl px-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">{title}</h1>
            <p className="text-xl md:text-2xl font-light tracking-wide">{subtitle}</p>
        </div>
    </div>
);

const FeatureItem = ({ text }) => (
    <li className="flex items-center gap-3 text-gray-700 font-medium">
        <span className="w-2 h-2 bg-secondary rounded-full" />
        {text}
    </li>
);

const MenuCard = ({ title, desc, image }) => (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
        <div className="h-64 overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="p-8">
            <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
            <p className="text-gray-500">{desc}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="text-secondary">{icon}</div>
        <span className="font-bold text-primary">{title}</span>
    </div>
);
