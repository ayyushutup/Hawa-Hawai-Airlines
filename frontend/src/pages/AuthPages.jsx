import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Load saved credentials on mount
    useState(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);

            // Save credentials if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedPassword');
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoAdmin = () => {
        setEmail('admin@hawahawai.com');
        setPassword('admin');
        setRememberMe(true);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-secondary/10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
                    <p className="text-secondary">Please enter your details to sign in</p>
                </div>

                {/* Demo Admin Button */}
                <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="w-full mb-4 py-2.5 bg-secondary/10 text-primary rounded-xl font-semibold text-sm hover:bg-secondary/20 transition-colors border border-secondary/20"
                >
                    🎭 Try Demo Admin Account
                </button>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium animate-fade-in flex items-center">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-primary ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-secondary/40 font-medium"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-primary ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-secondary/40 font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-accent bg-white border-secondary/30 rounded focus:ring-2 focus:ring-accent/20"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-secondary cursor-pointer">
                            Remember me for future logins
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 hover:translate-y-[-1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-secondary text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-accent font-bold hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            // Auto login or redirect to login (redirecting to login for now for clarity)
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100/50">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-primary mb-2">Create Account</h2>
                    <p className="text-secondary">Join Hawa Hawai for seamless travel</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium animate-fade-in flex items-center">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-primary ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-secondary/40 font-medium"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-primary ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-secondary/40 font-medium"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-primary ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-secondary/40 font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 hover:translate-y-[-1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center group"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <span className="flex items-center">
                                Create Account <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-secondary text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
