import { X, ArrowRight } from 'lucide-react';

export default function ArticleModal({ isOpen, onClose, article }) {
    if (!isOpen || !article) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white md:text-gray-800 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                    <div className="absolute bottom-4 left-4 text-white md:hidden">
                        <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-1 block">Insight {article.number}</span>
                        <h2 className="text-2xl font-display font-bold">{article.title}</h2>
                    </div>
                </div>

                {/* Text Section */}
                <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto bg-white">
                    <div className="hidden md:block mb-6">
                        <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-2 block">Insight {article.number}</span>
                        <h2 className="text-4xl font-display font-bold text-primary mb-2">{article.title}</h2>
                        <h3 className="text-xl text-gray-400 font-light">{article.subtitle}</h3>
                    </div>

                    <div className="prose prose-lg text-gray-600 mb-8 space-y-4">
                        {article.content.map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed">{paragraph}</p>
                        ))}
                    </div>

                    {/* Footer / CTA */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-400 italic">
                            Reading time: {article.readTime}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors"
                        >
                            Back to Home <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
