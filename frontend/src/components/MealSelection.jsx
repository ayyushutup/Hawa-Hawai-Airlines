import React, { useState } from 'react';
import { Utensils, Coffee, Ban, Leaf, Info } from 'lucide-react';

const MEAL_OPTIONS = [
    {
        id: 'std_veg',
        name: 'Paneer Butter Masala',
        price: 500,
        cuisine: 'Indian',
        calories: 650,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946dc7?q=80&w=500&auto=format&fit=crop',
        desc: 'Rich creamy tomato curry with soft paneer cubes, served with basmati rice and naan.'
    },
    {
        id: 'std_nonveg',
        name: 'Roast Chicken w/ Herbs',
        price: 650,
        cuisine: 'Continental',
        calories: 580,
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=500&auto=format&fit=crop',
        desc: 'Tender roasted chicken breast with rosemary potatoes and steamed seasonal veggies.'
    },
    {
        id: 'vegan_bowl',
        name: 'Buddha Power Bowl',
        price: 550,
        cuisine: 'Vegan',
        calories: 420,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop',
        desc: 'Fresh quinoa, avocado, chickpeas, and kale with a zesty lemon tahini dressing.'
    },
    {
        id: 'snack',
        name: 'Gourmet Club Sandwich',
        price: 300,
        cuisine: 'Light Bites',
        calories: 350,
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=500&auto=format&fit=crop',
        desc: 'Classic triple-decker with fresh lettuce, tomatoes, cheese, and grilled veggies.'
    },
    {
        id: 'fruit_platter',
        name: 'Seasonal Fruit Platter',
        price: 400,
        cuisine: 'Vegan',
        calories: 200,
        image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=500&auto=format&fit=crop',
        desc: 'A refreshing assortment of cut exotic fruits and berries.'
    },
    {
        id: 'none',
        name: 'No Meal',
        price: 0,
        cuisine: 'Other',
        calories: 0,
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500&auto=format&fit=crop',
        desc: 'I will skip the meal service for this flight.'
    }
];

const CUISINES = ['All', 'Indian', 'Continental', 'Vegan', 'Light Bites'];

export default function MealSelection({ selectedMeal, onSelectMeal }) {
    const [filter, setFilter] = useState('All');

    const filteredMeals = filter === 'All'
        ? MEAL_OPTIONS
        : MEAL_OPTIONS.filter(m => m.cuisine === filter);

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CUISINES.map(cuisine => (
                    <button
                        key={cuisine}
                        onClick={() => setFilter(cuisine)}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                            ${filter === cuisine
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                            }
                        `}
                    >
                        {cuisine}
                    </button>
                ))}
            </div>

            {/* Meal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                {filteredMeals.map((meal) => (
                    <div
                        key={meal.id}
                        onClick={() => onSelectMeal(meal)}
                        className={`
                            group relative rounded-xl overflow-hidden cursor-pointer transition-all border
                            ${selectedMeal?.id === meal.id
                                ? 'ring-2 ring-accent border-accent shadow-lg shadow-accent/20'
                                : 'border-secondary/10 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Image */}
                        <div className="h-32 w-full overflow-hidden">
                            <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <div className="flex justify-between items-end mb-1">
                                <h4 className="font-bold text-sm leading-tight text-white">{meal.name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meal.price === 0 ? 'bg-white/20' : 'bg-accent'}`}>
                                    {meal.price === 0 ? 'Free' : `₹${meal.price}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/80">
                                {meal.calories > 0 && <span>{meal.calories} kcal</span>}
                                <span>•</span>
                                <span>{meal.cuisine}</span>
                            </div>
                        </div>

                        {/* Selection Checkmark */}
                        {selectedMeal?.id === meal.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        )}

                        {/* Hover Description (Desktop) */}
                        <div className="absolute inset-0 bg-primary/95 p-4 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h4 className="font-bold text-white mb-2">{meal.name}</h4>
                            <p className="text-xs text-white/80 leading-relaxed mb-4">{meal.desc}</p>
                            <button className="px-3 py-1.5 bg-white text-primary text-xs font-bold rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                Select This Meal
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Summary */}
            {selectedMeal && (
                <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-xl text-sm border border-secondary/10">
                    <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-primary">{selectedMeal.name}</span> selected.
                        <p className="text-secondary/60 text-xs mt-0.5">{selectedMeal.desc}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
