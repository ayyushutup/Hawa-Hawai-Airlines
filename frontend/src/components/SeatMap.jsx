import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ROWS_FIRST_CLASS = 2; // Rows 1-2
const ROWS_TOTAL = 10;

// Layout configurations
const LAYOUT_FIRST = ['A', 'F']; // 1-1 or 2-2 depending on width, let's do 2-2 logic but visually spaced
const LAYOUT_ECONOMY = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function SeatMap({ flightId, selectedSeat, onSelectSeat }) {
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const data = await api.getSeats(flightId);
                setOccupiedSeats(data);
            } catch (error) {
                console.error("Failed to fetch seats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();
    }, [flightId]);

    const handleSeatClick = (seat) => {
        if (!occupiedSeats.includes(seat)) {
            onSelectSeat(seat === selectedSeat ? null : seat);
        }
    };

    const getSeatType = (row) => {
        if (row <= ROWS_FIRST_CLASS) return 'First Class';
        if (row <= 5) return 'Business';
        return 'Economy';
    };

    const renderSeat = (row, col, isFirstClass) => {
        const seatNum = `${row}${col}`;
        const isOccupied = occupiedSeats.includes(seatNum);
        const isSelected = selectedSeat === seatNum;
        const type = getSeatType(row);

        // Tooltip text
        let title = `${type} - ${seatNum}`;
        if (isOccupied) title += " (Occupied)";
        else if (col === 'A' || col === 'F') title += " (Window Seat)";
        else if (col === 'C' || col === 'D') title += " (Aisle Seat)";

        return (
            <div key={seatNum} className="relative group">
                <button
                    disabled={isOccupied}
                    onClick={() => handleSeatClick(seatNum)}
                    className={`
                        transition-all duration-300 relative
                        flex flex-col items-center justify-center
                        ${isFirstClass ? 'w-12 h-14 mx-2' : 'w-8 h-10 mx-0.5'}
                        ${isOccupied
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:-translate-y-1'
                        }
                    `}
                    title={title}
                >
                    {/* Seat Shape */}
                    <div className={`
                        w-full h-full rounded-t-xl rounded-b-md shadow-sm border-b-2
                        ${isSelected
                            ? 'bg-accent border-accent-dark shadow-accent/30'
                            : isOccupied
                                ? 'bg-slate-300 border-slate-400'
                                : row <= ROWS_FIRST_CLASS
                                    ? 'bg-purple-100 border-purple-200 hover:bg-purple-200'
                                    : 'bg-white border-slate-200 hover:border-accent hover:bg-sky-50'
                        }
                    `}>
                        {/* Headrest */}
                        <div className={`
                            w-3/4 h-2 mx-auto mt-1 rounded-full opacity-50
                            ${isSelected ? 'bg-white' : 'bg-current'}
                        `}></div>
                    </div>

                    {/* Armrests (Visual only) */}
                    <div className="absolute bottom-1 w-full flex justify-between px-1 pointer-events-none">
                        <div className={`w-1 h-3 rounded-full ${isSelected ? 'bg-accent-dark' : 'bg-slate-300'}`}></div>
                        <div className={`w-1 h-3 rounded-full ${isSelected ? 'bg-accent-dark' : 'bg-slate-300'}`}></div>
                    </div>
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {seatNum} • {type}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
    );

    return (
        <div className="flex flex-col items-center w-full">
            {/* Legend */}
            <div className="flex gap-4 mb-6 text-xs text-secondary font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> Available</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-accent rounded"></div> Selected</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded"></div> Occupied</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div> First Class</div>
            </div>

            {/* Fuselage Container */}
            <div className="relative bg-slate-100 rounded-[3rem] px-8 py-12 shadow-inner border border-slate-200 max-w-sm mx-auto">
                {/* Cockpit Indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-slate-200 to-transparent rounded-b-full opacity-50"></div>

                {/* Windows Left/Right */}
                <div className="absolute left-2 top-20 bottom-20 flex flex-col justify-between items-center w-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-3 bg-sky-200 rounded-full shadow-inner mb-6"></div>
                    ))}
                </div>
                <div className="absolute right-2 top-20 bottom-20 flex flex-col justify-between items-center w-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-3 bg-sky-200 rounded-full shadow-inner mb-6"></div>
                    ))}
                </div>

                {/* Wing Indicators */}
                <div className="absolute top-[45%] -left-8 w-8 h-32 bg-slate-200 skew-y-[20deg] rounded-l-lg opacity-50"></div>
                <div className="absolute top-[45%] -right-8 w-8 h-32 bg-slate-200 -skew-y-[20deg] rounded-r-lg opacity-50"></div>

                <div className="flex flex-col gap-6 relative z-10">
                    {/* First Class Section */}
                    <div>
                        <div className="text-[10px] text-center text-slate-400 font-bold tracking-widest uppercase mb-2">First Class</div>
                        {Array.from({ length: ROWS_FIRST_CLASS }, (_, i) => i + 1).map(row => (
                            <div key={row} className="flex justify-center items-center gap-4 mb-2">
                                <div className="text-[10px] text-slate-300 w-4 font-mono">{row}</div>
                                <div className="flex gap-4">
                                    <div className="flex gap-1">{['A', 'C'].map(col => renderSeat(row, col, true))}</div>
                                    <div className="w-4"></div> {/* Aisle */}
                                    <div className="flex gap-1">{['D', 'F'].map(col => renderSeat(row, col, true))}</div>
                                </div>
                                <div className="text-[10px] text-slate-300 w-4 font-mono text-right">{row}</div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed border-slate-300/50 mx-4"></div>

                    {/* Economy Section */}
                    <div>
                        <div className="text-[10px] text-center text-slate-400 font-bold tracking-widest uppercase mb-2">Economy</div>
                        {Array.from({ length: ROWS_TOTAL - ROWS_FIRST_CLASS }, (_, i) => i + ROWS_FIRST_CLASS + 1).map(row => (
                            <div key={row} className="flex justify-center items-center gap-1 mb-1">
                                <div className="text-[10px] text-slate-300 w-3 font-mono">{row}</div>
                                <div className="flex gap-1">
                                    <div className="flex gap-0.5">{['A', 'B', 'C'].map(col => renderSeat(row, col, false))}</div>
                                    <div className="w-4 flex items-center justify-center text-[8px] text-slate-300"></div> {/* Aisle */}
                                    <div className="flex gap-0.5">{['D', 'E', 'F'].map(col => renderSeat(row, col, false))}</div>
                                </div>
                                <div className="text-[10px] text-slate-300 w-3 font-mono text-right">{row}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-xs text-slate-400 mt-4 text-center">Rear of Aircraft</div>
        </div>
    );
}
