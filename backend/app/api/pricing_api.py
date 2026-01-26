from flask import Blueprint, jsonify, request
from app.services.booking_service import BookingService
from app.services.pricing_service import PricingService
from app.models.flight import Flight

bp = Blueprint('pricing', __name__)

@bp.route('/calculate-price', methods=['POST'])
def calculate_price():
    data = request.get_json()
    
    flight_id = data.get('flight_id')
    seat_class = data.get('seat_class', 'Economy')
    meal_price = data.get('meal_price', 0.0)
    baggage_kg = data.get('baggage_kg', 0)
    has_insurance = data.get('has_insurance', False)
    has_priority = data.get('has_priority', False)
    promo_code = data.get('promo_code')
    passenger_count = data.get('passenger_count', 1)

    if not flight_id:
        return jsonify({'error': 'Flight ID is required'}), 400

    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({'error': 'Flight not found'}), 404

    pricing = PricingService.calculate_booking_breakdown(
        flight=flight,
        seat_class=seat_class,
        meal_price=meal_price,
        baggage_kg=baggage_kg,
        has_insurance=has_insurance,
        has_priority=has_priority,
        promo_code=promo_code,
        passenger_count=passenger_count
    )
    
    return jsonify(pricing)
