"""
Service layer for booking operations.
"""
from typing import Dict, Any, Optional, List
from app import db
from app.models.booking import Booking
from app.models.flight import Flight
import random
import string


class BookingService:
    """Service class for handling booking operations."""
    
    @staticmethod
    def generate_reference() -> str:
        """Generate a unique 6-character booking reference."""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    @staticmethod
    def calculate_pricing_breakdown(
        flight_price: float,
        seat_class: str,
        meal_price: float = 0.0,
        baggage_kg: int = 0,
        has_insurance: bool = False,
        has_priority: bool = False
    ) -> Dict[str, float]:
        """
        Calculate the complete price breakdown for a booking.
        
        Args:
            flight_price: Base price of the flight
            seat_class: Class of seat (Economy, Business, First Class)
            meal_price: Price of selected meal
            baggage_kg: Extra baggage weight in kg
            has_insurance: Whether travel insurance is selected
            has_priority: Whether priority boarding is selected
            
        Returns:
            Dictionary with price breakdown including base_seat_price,
            meal_price, extras_price, taxes, and total_price
        """
        # Calculate price based on class
        multiplier = 1.0
        if seat_class == 'Business':
            multiplier = 1.5
        elif seat_class == 'First Class':
            multiplier = 2.5
            
        base_seat_price = flight_price * multiplier
        
        # Calculate Extras Price
        extras_price = 0.0
        
        # Baggage Tiers
        if baggage_kg == 20:
            extras_price += 20.0
        elif baggage_kg == 30:
            extras_price += 35.0
        elif baggage_kg == 40:
            extras_price += 60.0
            
        if has_insurance:
            extras_price += 15.0
            
        if has_priority:
            extras_price += 10.0
        
        subtotal = base_seat_price + float(meal_price) + extras_price
        taxes = subtotal * 0.18
        total_price = subtotal + taxes
        
        return {
            "base_seat_price": base_seat_price,
            "meal_price": float(meal_price),
            "extras_price": extras_price,
            "taxes": taxes,
            "total_price": total_price
        }

    @staticmethod
    def create_booking(
        flight_id: int,
        passenger_name: str,
        passenger_email: str,
        seat_number: Optional[str] = None,
        is_bot: bool = False,
        seat_class: str = 'Economy',
        meal_preference: Optional[str] = None,
        meal_price: float = 0.0,
        payment_method: str = 'Credit Card',
        user_id: Optional[int] = None,
        baggage_kg: int = 0,
        has_insurance: bool = False,
        has_priority: bool = False,
        promo_code: Optional[str] = None
    ) -> Booking:
        """
        Create a new booking for a flight.
        
        Args:
            flight_id: ID of the flight to book
            passenger_name: Name of the passenger
            passenger_email: Email of the passenger
            seat_number: Optional specific seat (e.g., "12A")
            is_bot: Whether this is a bot booking
            seat_class: Class of seat
            meal_preference: Selected meal option
            meal_price: Price of selected meal
            payment_method: Payment method used
            user_id: ID of logged-in user (if any)
            baggage_kg: Extra baggage weight
            has_insurance: Whether travel insurance is selected
            has_priority: Whether priority boarding is selected
            
        Returns:
            The created Booking object
            
        Raises:
            ValueError: If validation fails or flight is not found/full
        """
        import re
        
        # Email validation
        if not re.match(r"[^@]+@[^@]+\.[^@]+", passenger_email):
            raise ValueError("Invalid email address")

        flight = Flight.query.get(flight_id)
        if not flight:
            raise ValueError("Flight not found")
            
        # Check capacity
        current_bookings = Booking.query.filter_by(flight_id=flight_id).count()
        if current_bookings >= flight.total_seats:
            raise ValueError("Flight is fully booked")

        # Calculate Price using the centralized logic
        pricing = BookingService.calculate_pricing_breakdown(
            flight_price=flight.price,
            seat_class=seat_class,
            meal_price=meal_price,
            baggage_kg=baggage_kg,
            has_insurance=has_insurance,
            has_priority=has_priority
        )
        total_price = pricing['total_price']
        extras_price = pricing['extras_price']

        # Generate Reference
        reference = BookingService.generate_reference()
        # Ensure uniqueness (simple loop)
        while Booking.query.filter_by(booking_reference=reference).first():
            reference = BookingService.generate_reference()
            
        # Check for seat availability if seat selected
        if seat_number:
            existing_booking = Booking.query.filter_by(flight_id=flight_id, seat_number=seat_number).first()
            if existing_booking:
                raise ValueError(f"Seat {seat_number} is already occupied")

        if is_bot:
            transaction_id = f"BOT-{BookingService.generate_reference()}"
        else:
            transaction_id = f"TXN-{BookingService.generate_reference()}-{random.randint(1000, 9999)}"

        booking = Booking(
            booking_reference=reference,
            flight_id=flight_id,
            passenger_name=passenger_name,
            passenger_email=passenger_email,
            seat_number=seat_number,
            seat_class=seat_class,
            price_paid=total_price,
            meal_preference=meal_preference,
            meal_price=meal_price,
            is_bot=is_bot,
            payment_method=payment_method,
            transaction_id=transaction_id,
            payment_status='Completed',
            user_id=user_id,
            baggage_kg=baggage_kg,
            has_insurance=has_insurance,
            has_priority=has_priority,
            extras_price=extras_price,
            promo_code=promo_code
        )

        db.session.add(booking)
        db.session.commit()

        return booking

    @staticmethod
    def get_occupied_seats(flight_id: int) -> List[str]:
        """
        Get list of occupied seat numbers for a flight.
        
        Args:
            flight_id: ID of the flight
            
        Returns:
            List of occupied seat numbers
        """
        bookings = Booking.query.filter_by(flight_id=flight_id).filter(Booking.seat_number != None).all()
        return [b.seat_number for b in bookings]

    @staticmethod
    def get_booking_by_reference(reference: str) -> Optional[Booking]:
        """
        Get a booking by its reference code.
        
        Args:
            reference: The booking reference code
            
        Returns:
            The Booking object if found, None otherwise
        """
        return Booking.query.filter_by(booking_reference=reference).first()
