import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Plane, User, LogOut, Globe, ChevronDown, Moon, Sun, Menu, X, Code } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const isCurrentPath = (path) => location.pathname === path;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav
            className="bg-primary border-b-2 border-secondary sticky top-0 z-50"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Brand */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group"
                        aria-label="Hawa Hawai - Go to homepage"
                        onClick={closeMobileMenu}
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Hawa Hawai"
                            className="h-16 w-auto object-contain transition-transform hover:scale-105"
                        />
                        <span className="text-white font-semibold text-xl sm:text-2xl tracking-widest uppercase group-hover:text-secondary transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                            Hawa Hawai
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center h-full" role="menubar">
                        <NavLink
                            to="/tracker"
                            icon={<Globe className="w-4 h-4" aria-hidden="true" />}
                            text="Flight Tracker"
                            isCurrent={isCurrentPath('/tracker')}
                        />
                        <NavLink
                            to="/"
                            icon={<Plane className="w-4 h-4" aria-hidden="true" />}
                            text="Book"
                            isCurrent={isCurrentPath('/')}
                        />
                        <NavDropdown
                            text="Experience"
                            items={[
                                { label: "Cabin Classes", to: "/experience/cabin" },
                                { label: "Dining", to: "/experience/dining" },
                                { label: "Lounges", to: "/experience/lounge" }
                            ]}
                        />
                        <NavDropdown
                            text="Privilege Club"
                            items={[
                                { label: "About Program", to: "/privilege-club" },
                                { label: "Benefits", to: "/privilege-club" },
                                { label: "Join Now", to: "/signup" }
                            ]}
                        />
                        <NavLink
                            to="/how-its-made"
                            icon={<Code className="w-4 h-4" aria-hidden="true" />}
                            text="How it's Made"
                            isCurrent={isCurrentPath('/how-its-made')}
                        />
                    </div>

                    {/* User / Auth + Theme Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-300 hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary rounded-lg"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" aria-hidden="true" />
                            ) : (
                                <Moon className="w-5 h-5" aria-hidden="true" />
                            )}
                        </button>

                        {/* Desktop Auth */}
                        <div className="hidden sm:flex items-center space-x-4">
                            {user ? (
                                <>
                                    {user.user.is_admin && (
                                        <Link
                                            to="/admin"
                                            className="text-gray-300 hover:text-white uppercase text-xs font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary rounded"
                                            aria-current={isCurrentPath('/admin') ? 'page' : undefined}
                                        >
                                            Admin Console
                                        </Link>
                                    )}
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-300 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary rounded"
                                        aria-current={isCurrentPath('/dashboard') ? 'page' : undefined}
                                        aria-label={`Your account: ${user.user.username}`}
                                    >
                                        <User className="w-4 h-4" aria-hidden="true" />
                                        <span className="hidden md:inline">{user.user.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-secondary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary rounded p-1"
                                        aria-label="Log out of your account"
                                    >
                                        <LogOut className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex text-sm font-bold tracking-widest uppercase">
                                    <Link
                                        to="/login"
                                        className="px-4 sm:px-6 py-2 text-white hover:text-secondary border-r border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 sm:px-6 py-2 bg-secondary text-primary hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-300 hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" aria-hidden="true" />
                            ) : (
                                <Menu className="w-6 h-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-primary z-40">
                    <div className="flex flex-col h-full overflow-y-auto">
                        <div className="py-4 px-4 space-y-1">
                            <MobileNavLink to="/" text="Book Flights" icon={<Plane />} onClick={closeMobileMenu} />
                            <MobileNavLink to="/tracker" text="Flight Tracker" icon={<Globe />} onClick={closeMobileMenu} />

                            {user ? (
                                <>
                                    <MobileNavLink to="/dashboard" text="My Bookings" icon={<User />} onClick={closeMobileMenu} />
                                    {user.user.is_admin && (
                                        <MobileNavLink to="/admin" text="Admin Console" icon={<User />} onClick={closeMobileMenu} />
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-4 text-left text-red-400 hover:bg-white/5 transition-colors rounded-lg"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Log Out</span>
                                    </button>
                                </>
                            ) : (
                                <div className="pt-4 space-y-3 px-4">
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block w-full py-3 text-center text-white border border-white/30 rounded-lg font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={closeMobileMenu}
                                        className="block w-full py-3 text-center bg-secondary text-primary rounded-lg font-bold uppercase tracking-wider hover:bg-yellow-400 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

// Mobile Nav Link
const MobileNavLink = ({ to, text, icon, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-4 text-gray-300 hover:text-secondary hover:bg-white/5 transition-colors rounded-lg"
    >
        <span className="w-5 h-5">{icon}</span>
        <span className="font-medium">{text}</span>
    </Link>
);

// Nav link with accessibility
const NavLink = ({ to, icon, text, isCurrent }) => (
    <Link
        to={to}
        className="h-full flex items-center px-4 xl:px-6 text-gray-300 hover:text-secondary hover:bg-white/5 border-l border-white/5 uppercase text-xs font-bold tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
        role="menuitem"
        aria-current={isCurrent ? 'page' : undefined}
    >
        <span className="flex items-center gap-2">
            {icon}
            {text}
        </span>
    </Link>
);

// Nav dropdown with accessibility
// Nav dropdown with accessibility
const NavDropdown = ({ text, items }) => (
    <div className="relative group h-full">
        <button
            className="h-full flex items-center px-4 xl:px-6 text-gray-300 hover:text-secondary hover:bg-white/5 border-l border-white/5 uppercase text-xs font-bold tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
            aria-haspopup="true"
        >
            <span className="flex items-center gap-2">
                {text}
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" aria-hidden="true" />
            </span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute top-full left-0 w-56 bg-primary border-t-2 border-secondary shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
            {items.map((item, idx) => (
                <Link
                    key={idx}
                    to={item.to}
                    className="block px-6 py-4 text-gray-300 hover:text-secondary hover:bg-white/5 text-xs font-bold uppercase tracking-wider border-b border-white/5 last:border-0 transition-colors"
                >
                    {item.label}
                </Link>
            ))}
        </div>
    </div>
);
