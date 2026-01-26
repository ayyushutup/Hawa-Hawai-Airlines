from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.flight import Flight
from app.models.booking import Booking
from datetime import datetime
import math

bp = Blueprint('tracking', __name__)


def to_rad(deg):
    return deg * math.pi / 180

def to_deg(rad):
    return rad * 180 / math.pi

def calculate_position(lat1, lon1, lat2, lon2, fraction):
    """
    Calculate intermediate point between two coordinates given a fraction (0-1)
    along the Great Circle path.
    """
    φ1 = to_rad(lat1)
    λ1 = to_rad(lon1)
    φ2 = to_rad(lat2)
    λ2 = to_rad(lon2)

    # Distance (angular)
    d = 2 * math.asin(math.sqrt(math.pow(math.sin((φ2 - φ1) / 2), 2) +
                                math.cos(φ1) * math.cos(φ2) * math.pow(math.sin((λ2 - λ1) / 2), 2)))
    
    # If points are too close, just return the first point
    if d == 0:
        return lat1, lon1

    # Constants
    a = math.sin((1 - fraction) * d) / math.sin(d)
    b = math.sin(fraction * d) / math.sin(d)

    # Calculate x, y, z
    x = a * math.cos(φ1) * math.cos(λ1) + b * math.cos(φ2) * math.cos(λ2)
    y = a * math.cos(φ1) * math.sin(λ1) + b * math.cos(φ2) * math.sin(λ2)
    z = a * math.sin(φ1) + b * math.sin(φ2)

    φi = math.atan2(z, math.sqrt(x*x + y*y))
    λi = math.atan2(y, x)

    return to_deg(φi), to_deg(λi)

def calculate_bearing(lat1, lon1, lat2, lon2):
    """
    Calculate initial bearing from point 1 to point 2 for Great Circle path.
    """
    φ1 = to_rad(lat1)
    λ1 = to_rad(lon1)
    φ2 = to_rad(lat2)
    λ2 = to_rad(lon2)

    y = math.sin(λ2 - λ1) * math.cos(φ2)
    x = math.cos(φ1) * math.sin(φ2) - \
        math.sin(φ1) * math.cos(φ2) * math.cos(λ2 - λ1)
    
    θ = math.atan2(y, x)
    
    return (to_deg(θ) + 360) % 360

@bp.route('/active', methods=['GET'])
def get_active_flights():
    """
    Get all currently active flights with their calculated positions.
    """
    try:
        now = datetime.utcnow()
        check_time = datetime.now()

        # Find flights in the air
        active_flights = Flight.query.filter(
            Flight.departure_time <= check_time,
            Flight.arrival_time >= check_time,
            Flight.status != 'Cancelled'
        ).all()

        # Check for user context
        user_flight_ids = set()
        try:
            verify_jwt_in_request(optional=True)
            identity = get_jwt_identity()
            if identity:
                user_bookings = Booking.query.filter_by(user_id=identity).all()
                user_flight_ids = {b.flight_id for b in user_bookings}
        except Exception:
            pass

        results = []
        for flight in active_flights:
            # Calculate progress
            total_duration = (flight.arrival_time - flight.departure_time).total_seconds()
            elapsed = (check_time - flight.departure_time).total_seconds()
            
            if total_duration <= 0:
                continue

            progress = elapsed / total_duration
            progress = max(0.0, min(1.0, progress)) # Clamp

            # Coordinates
            lat1 = flight.origin.latitude
            lon1 = flight.origin.longitude
            lat2 = flight.destination.latitude
            lon2 = flight.destination.longitude

            # Use Great Circle Interpolation
            current_lat, current_lon = calculate_position(lat1, lon1, lat2, lon2, progress)
            
            # Use Great Circle Bearing (calculated from current position to dest for "instantaneous" heading, 
            # or from origin to dest for "initial" bearing? 
            # Ideally instantaneous bearing at current point looks best for rotation)
            heading = calculate_bearing(current_lat, current_lon, lat2, lon2)

            # Determine flight type
            is_my_flight = flight.id in user_flight_ids

            # Dynamic Status Message
            import random
            
            # Simulate Altitude and Speed
            cruising_altitude = 35000 + (hash(flight.id) % 3000) # Randomize slightly per flight
            cruising_speed = 500 + (hash(flight.id) % 100) # Knots

            if progress < 0.1: # Climb
                altitude = (progress / 0.1) * cruising_altitude
                speed = (progress / 0.1) * cruising_speed
                status_msg = "Taking off"
            elif progress > 0.9: # Descent
                altitude = ((1.0 - progress) / 0.1) * cruising_altitude
                speed = ((1.0 - progress) / 0.1) * cruising_speed
                status_msg = "Descending"
            else: # Cruise
                altitude = cruising_altitude
                speed = cruising_speed
                
                cruise_msgs = [
                    f"Cruising at {int(altitude):,}ft",
                    "Cruising altitude maintained",
                    "Serving in-flight meals",
                    "Flying over international waters"
                ]
                # Randomly inject "weather" events
                if random.random() < 0.2: 
                    cruise_msgs.append("Experiencing light turbulence")
                    cruise_msgs.append("Adjusting course for weather")
                
                status_msg = random.choice(cruise_msgs)

            results.append({
                'id': flight.id,
                'flight_number': flight.flight_number,
                'origin': flight.origin.code,
                'origin_lat': float(lat1),
                'origin_lng': float(lon1),
                'destination': flight.destination.code,
                'dest_lat': float(lat2),
                'dest_lng': float(lon2),
                'latitude': current_lat,
                'longitude': current_lon,
                'heading': heading,
                'progress': progress,
                'aircraft_type': flight.aircraft_type,
                'is_my_flight': is_my_flight,
                'status': flight.status,
                'live_status': status_msg,
                'altitude': int(altitude),
                'speed': int(speed)
            })

        return jsonify(results)

    except Exception as e:
        print(f"Tracking Logic Error: {e}")
        return jsonify({'error': str(e)}), 500
