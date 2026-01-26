
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const CustomSelect = ({ label, value, options, onChange, placeholder, className, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.subLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-4 bg-white border items-center flex justify-between outline-none transition-all h-14 text-left
                    ${isOpen ? 'border-secondary ring-1 ring-secondary' : 'border-gray-300 hover:border-gray-400'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    <div className="truncate">
                        {selectedOption ? (
                            <span className="text-primary font-medium text-base">
                                {selectedOption.label}
                                <span className="text-gray-400 ml-2 text-sm">{selectedOption.subLabel}</span>
                            </span>
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors
                                        ${value === opt.value ? 'bg-secondary/10' : ''}`}
                                >
                                    <div>
                                        <div className={`font-semibold ${value === opt.value ? 'text-primary' : 'text-gray-700'}`}>
                                            {opt.label}
                                        </div>
                                        {opt.subLabel && (
                                            <div className="text-xs text-gray-400 group-hover:text-gray-500">
                                                {opt.subLabel}
                                            </div>
                                        )}
                                    </div>
                                    {value === opt.value && <Check className="w-4 h-4 text-secondary" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-400">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
