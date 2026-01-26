from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from app import db
from app.models.flight import Flight
from app.models.booking import Booking
from app.utils.decorators import admin_required
from datetime import datetime

bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@bp.route('/flights', methods=['GET'])
@admin_required
def get_all_flights():
    # Use subquery to get booking counts efficiently (avoids N+1)
    booking_counts = db.session.query(
        Booking.flight_id,
        db.func.count(Booking.id).label('count')
    ).group_by(Booking.flight_id).subquery()
    
    flights_with_counts = db.session.query(
        Flight,
        db.func.coalesce(booking_counts.c.count, 0).label('bookings_count')
    ).outerjoin(
        booking_counts, Flight.id == booking_counts.c.flight_id
    ).options(
        joinedload(Flight.origin),
        joinedload(Flight.destination)
    ).order_by(Flight.departure_time.desc()).all()
    
    flight_data = []
    for flight, bookings_count in flights_with_counts:
        flight_dict = flight.to_dict()
        flight_dict['bookings_count'] = bookings_count
        flight_data.append(flight_dict)

    return jsonify(flight_data)


@bp.route('/flights', methods=['POST'])
@admin_required
def create_flight():
    data = request.get_json()
    
    try:
        new_flight = Flight(
            flight_number=data['flight_number'],
            origin_code=data['origin_code'],
            destination_code=data['destination_code'],
            departure_time=datetime.fromisoformat(data['departure_time']),
            arrival_time=datetime.fromisoformat(data['arrival_time']),
            price=float(data['price']),
            base_price=float(data['price']),
            aircraft_type=data.get('aircraft_type', 'Boeing 737'),
            total_seats=int(data.get('total_seats', 180)),
            status='Scheduled'
        )
        db.session.add(new_flight)
        db.session.commit()
        return jsonify(new_flight.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@bp.route('/flights/<int:id>', methods=['PUT'])
@admin_required
def update_flight(id):
    flight = Flight.query.get_or_404(id)
    data = request.get_json()

    if 'status' in data:
        flight.status = data['status']
    if 'price' in data:
        flight.price = float(data['price'])
    
    db.session.commit()
    return jsonify(flight.to_dict())


@bp.route('/flights/<int:id>/manifest', methods=['GET'])
@admin_required
def get_flight_manifest(id):
    bookings = Booking.query.filter_by(flight_id=id).all()
    manifest = [{
        'passenger_name': b.passenger_name,
        'passenger_email': b.passenger_email,
        'seat_number': b.seat_number,
        'seat_class': b.seat_class,
        'meal_preference': b.meal_preference
    } for b in bookings]
    
    return jsonify(manifest)


@bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    total_bookings = Booking.query.count()
    active_flights = Flight.query.filter(Flight.status == 'Scheduled').count()
    
    # Calculate revenue
    revenue_query = db.session.query(db.func.sum(Booking.price_paid)).scalar()
    total_revenue = revenue_query if revenue_query else 0
    
    # Most popular route
    popular_route = db.session.query(
        Flight.origin_code, 
        Flight.destination_code, 
        db.func.count(Booking.id).label('count')
    ).join(Booking, Flight.id == Booking.flight_id)\
     .group_by(Flight.origin_code, Flight.destination_code)\
     .order_by(db.func.count(Booking.id).desc())\
     .first()
     
    popular_route_str = "N/A"
    if popular_route:
        popular_route_str = f"{popular_route[0]} -> {popular_route[1]}"

    # Bot vs Real split
    bot_bookings = Booking.query.filter_by(is_bot=True).count()
    real_bookings = total_bookings - bot_bookings
    
    return jsonify({
        'total_revenue': total_revenue,
        'total_bookings': total_bookings,
        'active_flights': active_flights,
        'bot_bookings': bot_bookings,
        'real_bookings': real_bookings,
        'popular_route': popular_route_str
    })


@bp.route('/bookings/recent', methods=['GET'])
@admin_required
def get_recent_bookings():
    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    per_page = min(per_page, 100)  # Max 100 per page
    
    # Use joinedload to eagerly load flight relationship (avoids N+1)
    bookings_query = Booking.query.options(
        joinedload(Booking.flight).joinedload(Flight.origin),
        joinedload(Booking.flight).joinedload(Flight.destination)
    ).order_by(Booking.booking_date.desc())
    
    # Paginate
    pagination = bookings_query.paginate(page=page, per_page=per_page, error_out=False)
    bookings = pagination.items
    
    results = []
    for booking in bookings:
        if not booking.flight:
            continue  # Skip orphaned bookings

        results.append({
            'passenger_name': booking.passenger_name,
            'passenger_email': booking.passenger_email,
            'flight_number': booking.flight.flight_number,
            'origin': booking.flight.origin_code,
            'destination': booking.flight.destination_code,
            'booking_date': booking.booking_date.isoformat(),
            'price_paid': booking.price_paid,
            'seat_number': booking.seat_number,
            'is_bot': booking.is_bot
        })
    
    return jsonify({
        'bookings': results,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })
