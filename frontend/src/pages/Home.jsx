import FlightSearch from '../components/FlightSearch';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ArticleModal from '../components/ArticleModal';
import DestinationsModal from '../components/DestinationsModal';

export default function Home() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showDestinations, setShowDestinations] = useState(false);

    const images = [
        '/assets/carousel/slide1.png',
        '/assets/carousel/slide2.jpg',
        '/assets/carousel/slide3.jpg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="bg-white">
            {/* Hero Section - Enterprise Style */}
            <div className="relative min-h-[60vh] sm:min-h-[70vh] lg:h-[85vh] bg-primary overflow-hidden">

                {/* Background Carousel */}
                <div className="absolute inset-0">
                    {images.map((img, index) => (
                        <div
                            key={img}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img
                                src={img}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay for better text readability - reduced opacity for more vibrant images */}
                            <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
                        </div>
                    ))}

                    {/* Gradient Overlays - lighter for better image visibility */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(46,0,75,0.25),_rgba(26,26,26,0.45))]" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
                </div>

                <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex flex-col justify-center py-12 sm:py-16 lg:py-0">
                    <div className="max-w-4xl space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in-up md:pl-8">

                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold text-white tracking-tighter leading-[0.9]">
                            EXPLORE.<br />
                            DISCOVER.<br />
                            <span className="text-secondary">SOAR.</span>
                        </h1>
                        <p className="text-sm sm:text-lg md:text-xl text-gray-300 font-light tracking-wide max-w-xl border-l-2 border-secondary pl-4 sm:pl-6">
                            Your journey begins with a single click. From bustling cities to serene escapes,
                            Hawa Hawai connects you to 140+ destinations with unparalleled comfort and style.
                        </p>

                        <div className="pt-4 sm:pt-8">
                            <button
                                onClick={() => setShowDestinations(true)}
                                className="group flex items-center gap-3 sm:gap-4 text-white uppercase text-xs sm:text-sm font-bold tracking-widest hover:text-secondary transition-colors"
                            >
                                Explore Destinations
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Module Overlap */}
            <div className="bg-white pb-10 sm:pb-20 px-4 sm:px-6 lg:px-12">
                <FlightSearch />
            </div>

            {/* Features Section with Images */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                    <FeatureCard
                        number="01"
                        title="Gourmet Dining"
                        desc="Experience a culinary journey with our new visual menu featuring Indian, Continental, and Vegan delicacies."
                        image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop"
                        onClick={() => setSelectedArticle(ARTICLES['01'])}
                    />
                    <FeatureCard
                        number="02"
                        title="Virtual Cabin"
                        desc="Pick your perfect seat with our immersive fuselage map. First Class or Economy, the choice is yours."
                        image="/assets/features/virtual_cabin.png"
                        onClick={() => setSelectedArticle(ARTICLES['02'])}
                    />
                    <FeatureCard
                        number="03"
                        title="Smart Flexibility"
                        desc="Change of plans? Enjoy instant refunds and transparent policies with our unified dashboard."
                        image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop"
                        onClick={() => setSelectedArticle(ARTICLES['03'])}
                    />
                </div>
            </div>

            <ArticleModal
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                article={selectedArticle}
            />

            <DestinationsModal
                isOpen={showDestinations}
                onClose={() => setShowDestinations(false)}
            />

        </div>
    );
}

const FeatureCard = ({ number, title, desc, image, onClick }) => (
    <div onClick={onClick} className="group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
        {/* Image */}
        <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
            <span className="absolute bottom-4 left-4 text-5xl sm:text-6xl font-display font-bold text-white/30">{number}</span>
        </div>
        {/* Content */}
        <div className="p-5 sm:p-6 border-t-4 border-secondary">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 uppercase tracking-tight group-hover:text-secondary transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const ARTICLES = {
    '01': {
        number: '01',
        title: "Savor the Skies",
        subtitle: "A culinary masterpiece at 35,000 feet.",
        readTime: "3 min read",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
        content: [
            "At Hawa Hawai, we believe that the journey should be as flavorful as the destination. Our new 'Gourmet Dining' experience is not just a meal; it's a celebration of global cuisine, curated by world-renowned chefs who understand the nuances of taste at altitude.",
            "Choose from our expanded menu featuring authentic regional Indian curries, light and refreshing Continental classics, or our innovative plant-based Vegan selection. Each dish is prepared with locally sourced ingredients, ensuring freshness and sustainability.",
            "We've also revolutionized how you order. With our new Visual Menu, you can see high-resolution previews of every dish before you fly. Track your calories, check for allergens, and customize your meal to your exact preferences. Bon appétit!"
        ]
    },
    '02': {
        number: '02',
        title: "Sanctuary in the Clouds",
        subtitle: "Redefining personal space and comfort.",
        readTime: "2 min read",
        image: "/assets/features/virtual_cabin.png",
        content: [
            "Step into a world where comfort knows no bounds. Our new cabin interiors are designed with one philosophy: the passenger comes first. Whether you're in First Class or Economy, every inch of your space has been optimized for relaxation.",
            "Our flagship 'Virtual Cabin' feature allows you to tour the aircraft before you even pack your bags. Using immersive 3D technology, you can explore the layout, check the view from your window, and ensure you're seated exactly where you want to be.",
            "In our premium cabins, experience the privacy of our new Suites, featuring lie-flat beds, 4K entertainment screens, and ambient lighting that adjusts to your circadian rhythm to reduce jet lag. Welcome home."
        ]
    },
    '03': {
        number: '03',
        title: "Travel on Your Terms",
        subtitle: "Flexibility meets peace of mind.",
        readTime: "2 min read",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
        content: [
            "Life remembers to be unpredictable, and we believe your travel plans should be able to keep up. That's why we've introduced 'Smart Flexibility'—a suite of features designed to give you total control over your booking.",
            "Need to cancel? Our new instant refund calculator shows you exactly what you'll get back, based on real-time policy data. No hidden fees, no long calls with support agents. Just one click and your funds are on their way.",
            "We've also simplified the process of changing flights. With our unified dashboard, you can swap dates, upgrade your seat, or add passengers instantly. Travel with the confidence that Hawa Hawai has your back, no matter what happens."
        ]
    }
};
