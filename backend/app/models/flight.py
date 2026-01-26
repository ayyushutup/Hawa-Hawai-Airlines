from app import db
from datetime import datetime


class Flight(db.Model):
    __tablename__ = 'flights'

    id = db.Column(db.Integer, primary_key=True)
    flight_number = db.Column(db.String(20), unique=True, nullable=False)
    origin_code = db.Column(db.String(3), db.ForeignKey('airports.code'), nullable=False, index=True)
    destination_code = db.Column(db.String(3), db.ForeignKey('airports.code'), nullable=False, index=True)
    departure_time = db.Column(db.DateTime, nullable=False, index=True)
    arrival_time = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Scheduled', index=True)  # Scheduled, Delayed, Canceled
    aircraft_type = db.Column(db.String(50), nullable=False)
    total_seats = db.Column(db.Integer, default=60, nullable=False)
    
    # Relationships
    origin = db.relationship('Airport', foreign_keys=[origin_code])
    destination = db.relationship('Airport', foreign_keys=[destination_code])

    def to_dict(self):
        return {
            'id': self.id,
            'flight_number': self.flight_number,
            'origin': self.origin.to_dict(),
            'destination': self.destination.to_dict(),
            'departure_time': self.departure_time.isoformat(),
            'arrival_time': self.arrival_time.isoformat(),
            'price': self.price,
            'status': self.status,
            'aircraft_type': self.aircraft_type
        }
