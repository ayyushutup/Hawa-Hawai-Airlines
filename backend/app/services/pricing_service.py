from app.models.flight import Flight
from app.models.booking import Booking
from app import db
from app.services.weather_service import WeatherService

class PricingService:
    @staticmethod
    def update_flight_price(flight_id):
        flight = Flight.query.get(flight_id)
        if not flight:
            return

        # 1. Base Price
        new_price = flight.base_price

        # 2. Demand Factor (Occupancy)
        current_bookings = Booking.query.filter_by(flight_id=flight_id).count()
        occupancy_rate = current_bookings / flight.total_seats
        
        # Simple Logic:
        # > 50% booked -> +10%
        # > 80% booked -> +20%
        # > 90% booked -> +50%
        demand_multiplier = 1.0
        if occupancy_rate > 0.9:
            demand_multiplier = 1.5
        elif occupancy_rate > 0.8:
            demand_multiplier = 1.2
        elif occupancy_rate > 0.5:
            demand_multiplier = 1.1

        # 3. Weather Factor
        weather_multiplier = WeatherService.get_weather_factor(flight.origin_code)

        # 4. Time-to-Departure Factor (New)
        from datetime import datetime
        time_diff = flight.departure_time - datetime.utcnow()
        days_until_departure = time_diff.days

        time_multiplier = 1.0
        if days_until_departure < 3:
            time_multiplier = 1.5
        elif days_until_departure < 7:
            time_multiplier = 1.2
        elif days_until_departure < 14:
            time_multiplier = 1.1

        # Final Price
        final_price = new_price * demand_multiplier * weather_multiplier * time_multiplier

        # Update DB
        flight.price = round(final_price, 2)
        db.session.commit()
        return flight.price

    @staticmethod
    def calculate_booking_breakdown(flight, seat_class, meal_price, baggage_kg, has_insurance, has_priority, promo_code=None, passenger_count=1):
        from app.services.promo_service import PromoService
        
        base_price = flight.price
        
        # Seat Class
        class_multipliers = {
            'Economy': 1.0,
            'Business': 2.5,
            'First Class': 4.0
        }
        multiplier = class_multipliers.get(seat_class, 1.0)
        seat_price_per_person = base_price * multiplier
        
        # Extras per person
        baggage_price = baggage_kg * 500 # 500 per kg
        insurance_price = 2000 if has_insurance else 0
        priority_price = 1500 if has_priority else 0
        
        extras_price_per_person = baggage_price + insurance_price + priority_price
        
        # Total per person
        subtotal_per_person = seat_price_per_person + meal_price + extras_price_per_person
        
        # Total for all passengers
        subtotal_all = subtotal_per_person * passenger_count
        
        # Discount
        discount = PromoService.calculate_discount(subtotal_all, promo_code)
        
        # Taxes (18% GST)
        taxable_amount = subtotal_all - discount
        taxes = taxable_amount * 0.18
        
        total_price = taxable_amount + taxes
        
        return {
            'base_unit_price': base_price,
            'seat_class_multiplier': multiplier,
            'seat_price_per_person': seat_price_per_person,
            'meal_price_per_person': meal_price,
            'extras_price_per_person': extras_price_per_person,
            'subtotal_per_person': subtotal_per_person,
            'passenger_count': passenger_count,
            'subtotal_gross': subtotal_all,
            'discount_amount': discount,
            'taxes': taxes,
            'total_price': round(total_price, 2)
        }
