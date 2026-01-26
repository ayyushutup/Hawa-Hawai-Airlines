from app import create_app
from app.services.pricing_service import PricingService
from app.models.flight import Flight

app = create_app()
with app.app_context():
    flight = Flight.query.first()
    if flight:
        print(f"Testing calculation for Flight {flight.id} ({flight.base_price})")
        res = PricingService.calculate_booking_breakdown(
            flight=flight,
            seat_class='Business',
            meal_price=500,
            baggage_kg=0,
            has_insurance=True,
            has_priority=False,
            passenger_count=2
        )
        print("Result:", res)
    else:
        print("No flight found")
