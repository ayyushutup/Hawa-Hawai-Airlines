from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, jwt_required
from marshmallow import ValidationError
from datetime import datetime, timezone
from app import db
from app.services import FlightService, BookingService
from app.models.booking import Booking
from app.models.flight import Flight
from app.models.promo_code import PromoCode
from app.schemas import BookingSchema

bp = Blueprint('api', __name__)

# Initialize validation schema
booking_schema = BookingSchema()


@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return jsonify({
        'status': 'healthy',
        'service': 'hawa-hawai-api',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200




@bp.route('/flights', methods=['GET'])
def get_flights():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')

    if origin and destination and date:
        filters = {
            'min_price': request.args.get('min_price'),
            'max_price': request.args.get('max_price'),
            'stops': request.args.get('stops')
        }
        itineraries = FlightService.search_flights(origin, destination, date, filters)
        response_data = []
        for item in itineraries:
            response_data.append({
                'type': item['type'],
                'total_price': item['total_price'],
                'flights': [f.to_dict() for f in item['flights']]
            })
        return jsonify(response_data)
    else:
        flights = FlightService.get_all_flights()
        return jsonify([f.to_dict() for f in flights])


@bp.route('/airports', methods=['GET'])
def get_airports():
    from app.models.airport import Airport
    airports = Airport.query.all()
    return jsonify([a.to_dict() for a in airports])


@bp.route('/flights/<int:flight_id>/seats', methods=['GET'])
def get_flight_seats(flight_id):
    seats = BookingService.get_occupied_seats(flight_id)
    return jsonify(seats)


@bp.route('/book', methods=['POST'])
def create_booking():
    data = request.get_json()
    
    # Validate input using marshmallow schema
    try:
        validated_data = booking_schema.load(data)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    user_id = None
    
    # Check if user is logged in (optional auth)
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except Exception:
        pass  # Not logged in

    # Handle promo code
    promo_code = data.get('promo_code')
    discount_amount = 0.0
    
    try:
        booking = BookingService.create_booking(
            flight_id=validated_data['flight_id'],
            passenger_name=validated_data['passenger_name'],
            passenger_email=validated_data['passenger_email'],
            seat_number=validated_data.get('seat_number'),
            seat_class=validated_data.get('seat_class', 'Economy'),
            meal_preference=validated_data.get('meal_preference'),
            meal_price=validated_data.get('meal_price', 0.0),
            payment_method=validated_data.get('payment_method'),
            user_id=user_id,
            baggage_kg=validated_data.get('baggage_kg', 0),
            has_insurance=validated_data.get('has_insurance', False),
            has_priority=validated_data.get('has_priority', False),
            promo_code=promo_code
        )
        return jsonify(booking.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/my-bookings', methods=['GET'])
def get_my_bookings():
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.booking_date.desc()).all()
        
        results = []
        for b in bookings:
            booking_dict = b.to_dict()
            if b.flight:
                booking_dict['flight'] = b.flight.to_dict()
            results.append(booking_dict)
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401



@bp.route('/validate-promo', methods=['POST'])
def validate_promo():
    """Validate a promo code and return discount details."""
    data = request.get_json()
    code = data.get('code', '').upper().strip()
    booking_amount = data.get('amount', 0)
    
    if not code:
        return jsonify({'error': 'Promo code is required'}), 400
    
    promo = PromoCode.query.filter_by(code=code).first()
    
    if not promo:
        return jsonify({'valid': False, 'error': 'Invalid promo code'}), 200
    
    is_valid, message = promo.is_valid(booking_amount)
    
    if not is_valid:
        return jsonify({'valid': False, 'error': message}), 200
    
    discounted_amount, discount = promo.apply_discount(booking_amount)
    
    return jsonify({
        'valid': True,
        'code': promo.code,
        'discount_percent': promo.discount_percent,
        'discount_amount': discount,
        'final_amount': discounted_amount
    }), 200


@bp.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'running', 'service': 'Hawa Hawai Backend'})


@bp.route('/bookings/<string:reference>', methods=['GET'])
def get_booking_by_reference(reference):
    """
    Look up a booking by its reference ID.
    """
    booking = Booking.query.filter_by(booking_reference=reference.upper()).first()
    
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    # Include flight details
    result = booking.to_dict()
    if booking.flight:
        result['flight'] = booking.flight.to_dict()
        
        # Simulate delay reason if applicable
        if booking.flight.status in ['Delayed', 'Cancelled']:
            import zlib
            reasons = [
                "Severe Weather Conditions",
                "Air Traffic Control Restrictions",
                "Technical Maintenance Required",
                "Crew Scheduling Issue",
                "Late Arrival of Inbound Aircraft",
                "Airport Operational Restrictions"
            ]
            # Deterministic selection based on flight ID
            reason_idx = zlib.adler32(str(booking.flight.id).encode()) % len(reasons)
            result['flight']['status_reason'] = reasons[reason_idx]
            
    return jsonify(result), 200


@bp.route('/bookings/<string:reference>/cancel', methods=['POST'])
def cancel_booking(reference):
    """
    Cancel a booking by its reference ID.
    Calculates refund based on cancellation policy.
    """
    booking = Booking.query.filter_by(booking_reference=reference.upper()).first()
    
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking.status == 'Cancelled':
        return jsonify({'error': 'Booking is already cancelled'}), 400
    
    # Get cancellation reason from request
    data = request.get_json() or {}
    reason = data.get('reason', 'Customer requested cancellation')
    
    # Calculate refund based on how close to departure
    refund_percentage = 100
    if booking.flight:
        hours_until_departure = (booking.flight.departure_time - datetime.now()).total_seconds() / 3600
        if hours_until_departure < 2:
            refund_percentage = 0  # No refund within 2 hours
        elif hours_until_departure < 24:
            refund_percentage = 50  # 50% refund within 24 hours
        elif hours_until_departure < 72:
            refund_percentage = 75  # 75% refund within 72 hours
    
    refund_amount = (booking.price_paid or 0) * (refund_percentage / 100)
    
    # Update booking
    booking.status = 'Cancelled'
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.refund_amount = refund_amount
    booking.cancellation_reason = reason
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Booking cancelled successfully',
        'booking_reference': booking.booking_reference,
        'refund_percentage': refund_percentage,
        'refund_amount': refund_amount,
        'status': 'Cancelled'
    }), 200

