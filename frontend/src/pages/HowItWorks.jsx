import { Code, Layers, Palette, Terminal, Database, Cpu, Zap, Layout } from 'lucide-react';

export default function HowItWorks() {
    return (
        <div className="pt-20 bg-gray-50 min-h-screen">
            {/* Hero */}
            <div className="bg-primary text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="text-secondary font-bold tracking-widest uppercase mb-4 block animate-fade-in-up">Behind the Scenes</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in-up delay-100">Building Hawa Hawai</h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light animate-fade-in-up delay-200">
                        A deep dive into the modern technology stack and design philosophy powering this next-gen airline experience.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">

                {/* Tech Stack */}
                <Section title="The Technology Stack" subtitle="Cutting-edge tools for performance and scale.">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TechCard
                            icon={<Layout className="w-8 h-8" />}
                            title="Frontend Core"
                            items={['React 19', 'Vite', 'React Router v7']}
                            color="text-blue-500"
                        />
                        <TechCard
                            icon={<Palette className="w-8 h-8" />}
                            title="Styling & UI"
                            items={['Tailwind CSS v4', 'Lucide Icons', 'Google Fonts (Cinzel)']}
                            color="text-pink-500"
                        />
                        <TechCard
                            icon={<Database className="w-8 h-8" />}
                            title="Backend API"
                            items={['Python Flask', 'PostgreSQL', 'Gunicorn WSGI']}
                            color="text-green-500"
                        />
                        <TechCard
                            icon={<Cpu className="w-8 h-8" />}
                            title="AI & Assets"
                            items={['Google Gemini 2.0', 'Stable Diffusion (Images)', 'Dynamic Generation']}
                            color="text-purple-500"
                        />
                    </div>
                </Section>

                {/* Architecture */}
                <Section title="System Architecture" subtitle="Designed for modularity and separation of concerns.">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div className="flex-1 space-y-6">
                                <ArchBlock
                                    title="Client (SPA)"
                                    desc="React application served via Nginx/Vite. Handles all UI rendering, state management (Context API), and client-side routing."
                                    icon={<Layers />}
                                />
                                <div className="h-8 w-0.5 bg-gray-300 mx-auto md:ml-8"></div>
                                <ArchBlock
                                    title="API Gateway (Flask)"
                                    desc="REST interfaces for bookings, flights, and auth. Validates payloads via Marshmallow schemas."
                                    icon={<Terminal />}
                                />
                                <div className="h-8 w-0.5 bg-gray-300 mx-auto md:ml-8"></div>
                                <ArchBlock
                                    title="Data Layer (SQL)"
                                    desc="PostgreSQL recommended for production. Models defined via SQLAlchemy ORM."
                                    icon={<Database />}
                                />
                            </div>
                            <div className="flex-1 bg-gray-900 rounded-2xl p-6 text-left font-mono text-sm text-green-400 shadow-inner overflow-hidden">
                                <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <p># Backend Route Example</p>
                                <p>@bp.route('/book', methods=['POST'])</p>
                                <p>@jwt_required()</p>
                                <p>def create_booking():</p>
                                <p className="pl-4">data = booking_schema.load(request.json)</p>
                                <p className="pl-4">price = calculate_price(data)</p>
                                <p className="pl-4">db.session.add(new_booking)</p>
                                <p className="pl-4">return jsonify(ids), 201</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Features Highlight */}
                <Section title="Premium Features Implemented" subtitle="Beyond the basics.">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureHighlight
                            title="Interactive Experience"
                            desc="3D-style modal galleries for destinations and premium cabin tours."
                        />
                        <FeatureHighlight
                            title="Dynamic Pricing Engine"
                            desc="Real-time calculation based on passenger count, class multipliers, and promo codes."
                        />
                        <FeatureHighlight
                            title="Agentic Workflow"
                            desc="Built using an autonomous AI agent capable of planning, coding, and verifying its own work."
                        />
                    </div>
                </Section>

                {/* Production Infrastructure */}
                <Section title="Production Infrastructure" subtitle="Enterprise-grade systems for reliability and scale.">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TechCard
                            icon={<Database className="w-8 h-8" />}
                            title="PostgreSQL"
                            items={['Row-level locking', 'ACID compliance', 'JSON support']}
                            color="text-blue-600"
                        />
                        <TechCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Redis Caching"
                            items={['In-memory speed', 'Rate limiting', 'Session storage']}
                            color="text-red-500"
                        />
                        <TechCard
                            icon={<Terminal className="w-8 h-8" />}
                            title="Gunicorn WSGI"
                            items={['Multi-worker', 'Production-ready', 'Load balanced']}
                            color="text-green-600"
                        />
                        <TechCard
                            icon={<Layers className="w-8 h-8" />}
                            title="Nginx Reverse Proxy"
                            items={['HTTPS/TLS 1.3', 'Gzip compression', 'Static caching']}
                            color="text-orange-500"
                        />
                    </div>
                </Section>

                {/* DevOps & Security */}
                <Section title="DevOps & Security" subtitle="Automated pipelines and hardened configurations.">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Code className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="font-bold text-primary text-lg mb-2">GitHub Actions CI/CD</h4>
                                <p className="text-gray-500 text-sm">Automated testing on every push. Backend and frontend verified before merge.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Database className="w-8 h-8 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-primary text-lg mb-2">Automated Backups</h4>
                                <p className="text-gray-500 text-sm">Daily PostgreSQL backups with 7-day rotation. Never lose critical data.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Cpu className="w-8 h-8 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-primary text-lg mb-2">Security Hardening</h4>
                                <p className="text-gray-500 text-sm">256-bit keys, HSTS headers, rate limiting, and JWT authentication.</p>
                            </div>
                        </div>
                    </div>
                </Section>

            </div>
        </div>
    );
}

const Section = ({ title, subtitle, children }) => (
    <section>
        <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">{title}</h2>
            <p className="text-gray-500 text-lg">{subtitle}</p>
        </div>
        {children}
    </section>
);

const TechCard = ({ icon, title, items, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group">
        <div className={`mb-4 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        <h3 className="font-bold text-lg text-primary mb-4">{title}</h3>
        <ul className="space-y-2">
            {items.map((item, idx) => (
                <li key={idx} className="text-gray-500 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const ArchBlock = ({ title, desc, icon }) => (
    <div className="flex items-start gap-4 text-left">
        <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-primary text-lg">{title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{desc}</p>
        </div>
    </div>
);

const FeatureHighlight = ({ title, desc }) => (
    <div className="p-8 bg-primary text-white rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16" />
        </div>
        <h3 className="font-bold text-xl mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
    </div>
);
