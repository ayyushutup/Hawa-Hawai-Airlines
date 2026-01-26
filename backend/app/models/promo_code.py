from app import db
from datetime import datetime


class PromoCode(db.Model):
    """Model for promotional discount codes."""
    __tablename__ = 'promo_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    discount_percent = db.Column(db.Float, nullable=False)  # e.g., 10.0 for 10%
    valid_from = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime, nullable=False)
    max_uses = db.Column(db.Integer, nullable=True)  # None = unlimited
    current_uses = db.Column(db.Integer, default=0)
    min_booking_amount = db.Column(db.Float, default=0.0)  # Minimum order value
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_valid(self, booking_amount=0):
        """Check if promo code is currently valid."""
        now = datetime.utcnow()
        
        if not self.is_active:
            return False, "Promo code is no longer active"
        
        if now < self.valid_from:
            return False, "Promo code is not yet valid"
        
        if now > self.valid_until:
            return False, "Promo code has expired"
        
        if self.max_uses and self.current_uses >= self.max_uses:
            return False, "Promo code usage limit reached"
        
        if booking_amount < self.min_booking_amount:
            return False, f"Minimum booking amount of ₹{self.min_booking_amount} required"
        
        return True, "Valid"

    def apply_discount(self, amount):
        """Calculate discounted amount."""
        discount = amount * (self.discount_percent / 100)
        return amount - discount, discount

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'discount_percent': self.discount_percent,
            'valid_from': self.valid_from.isoformat(),
            'valid_until': self.valid_until.isoformat(),
            'max_uses': self.max_uses,
            'current_uses': self.current_uses,
            'min_booking_amount': self.min_booking_amount,
            'is_active': self.is_active
        }
