from app import db
from datetime import datetime


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(10), unique=True, nullable=False)
    flight_id = db.Column(db.Integer, db.ForeignKey('flights.id'), nullable=False, index=True)
    passenger_name = db.Column(db.String(100), nullable=False)
    passenger_email = db.Column(db.String(100), nullable=False)
    seat_number = db.Column(db.String(5), nullable=True)  # e.g., "12A"
    booking_date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_bot = db.Column(db.Boolean, default=False, index=True)
    seat_class = db.Column(db.String(20), default='Economy', nullable=False)
    price_paid = db.Column(db.Float, nullable=True)
    meal_preference = db.Column(db.String(50), nullable=True)
    meal_price = db.Column(db.Float, default=0.0)
    payment_method = db.Column(db.String(50), nullable=True)
    transaction_id = db.Column(db.String(50), nullable=True)
    payment_status = db.Column(db.String(20), default='Completed')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Extras
    baggage_kg = db.Column(db.Integer, default=0)
    has_insurance = db.Column(db.Boolean, default=False)
    has_priority = db.Column(db.Boolean, default=False)
    extras_price = db.Column(db.Float, default=0.0)
    
    # Promo code
    promo_code = db.Column(db.String(20), nullable=True)
    discount_amount = db.Column(db.Float, default=0.0)
    
    # Cancellation
    status = db.Column(db.String(20), default='Confirmed', index=True)  # Confirmed, Cancelled, Refunded
    cancelled_at = db.Column(db.DateTime, nullable=True)
    refund_amount = db.Column(db.Float, default=0.0)
    cancellation_reason = db.Column(db.String(200), nullable=True)

    # Relationships
    flight = db.relationship('Flight', backref='bookings')
    user = db.relationship('User', backref='bookings')

    def to_dict(self):
        return {
            'id': self.id,
            'booking_reference': self.booking_reference,
            'flight_id': self.flight_id,
            'passenger_name': self.passenger_name,
            'passenger_email': self.passenger_email,
            'seat_number': self.seat_number,
            'booking_date': self.booking_date.isoformat(),
            'is_bot': self.is_bot,
            'seat_class': self.seat_class,
            'price_paid': self.price_paid,
            'meal_preference': self.meal_preference,
            'meal_price': self.meal_price,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'payment_status': self.payment_status,
            'baggage_kg': self.baggage_kg,
            'has_insurance': self.has_insurance,
            'has_priority': self.has_priority,
            'extras_price': self.extras_price,
            'promo_code': self.promo_code,
            'discount_amount': self.discount_amount,
            'status': self.status,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'refund_amount': self.refund_amount
        }
