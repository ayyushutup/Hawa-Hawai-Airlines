"""
Marshmallow schemas for input validation.
"""
from marshmallow import Schema, fields, validate, ValidationError


class BookingSchema(Schema):
    """Schema for validating booking creation requests."""
    
    flight_id = fields.Integer(required=True, error_messages={
        'required': 'Flight ID is required',
        'invalid': 'Flight ID must be a valid integer'
    })
    
    passenger_name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={
            'required': 'Passenger name is required',
            'validator_failed': 'Name must be between 2 and 100 characters'
        }
    )
    
    passenger_email = fields.Email(
        required=True,
        error_messages={
            'required': 'Email is required',
            'invalid': 'Invalid email format'
        }
    )
    
    seat_number = fields.String(
        validate=validate.Regexp(r'^[0-9]{1,2}[A-K]$', error='Invalid seat format (e.g., 12A)'),
        load_default=None,
        allow_none=True
    )
    
    seat_class = fields.String(
        validate=validate.OneOf(['Economy', 'Business', 'First Class']),
        load_default='Economy'
    )
    
    meal_preference = fields.String(
        validate=validate.Length(max=50),
        load_default=None,
        allow_none=True
    )
    
    meal_price = fields.Float(load_default=0.0)
    
    payment_method = fields.String(
        validate=validate.OneOf(['Credit Card', 'Debit Card', 'UPI', 'Net Banking']),
        load_default='Credit Card'
    )
    
    baggage_kg = fields.Integer(
        validate=validate.Range(min=0, max=100),
        load_default=0
    )

    promo_code = fields.String(load_default=None, allow_none=True)
    
    has_insurance = fields.Boolean(load_default=False)
    has_priority = fields.Boolean(load_default=False)


class UserRegistrationSchema(Schema):
    """Schema for validating user registration requests."""
    
    username = fields.String(
        required=True,
        validate=[
            validate.Length(min=3, max=64),
            validate.Regexp(r'^[a-zA-Z0-9_]+$', error='Username can only contain letters, numbers, and underscores')
        ]
    )
    
    email = fields.Email(required=True)
    
    password = fields.String(
        required=True,
        validate=validate.Length(min=8, max=128),
        load_only=True  # Never serialize password
    )


class FlightCreateSchema(Schema):
    """Schema for validating flight creation by admin."""
    
    flight_number = fields.String(
        required=True,
        validate=validate.Regexp(r'^[A-Z]{2}[0-9]{1,4}$', error='Invalid flight number format (e.g., HW101)')
    )
    
    origin_code = fields.String(
        required=True,
        validate=validate.Length(equal=3),
        error_messages={'validator_failed': 'Airport code must be exactly 3 characters'}
    )
    
    destination_code = fields.String(
        required=True,
        validate=validate.Length(equal=3)
    )
    
    departure_time = fields.DateTime(required=True)
    arrival_time = fields.DateTime(required=True)
    
    price = fields.Float(
        required=True,
        validate=validate.Range(min=0, error='Price must be positive')
    )
    
    aircraft_type = fields.String(load_default='Boeing 737')
    total_seats = fields.Integer(
        validate=validate.Range(min=1, max=500),
        load_default=180
    )


def validate_booking_data(data: dict) -> dict:
    """
    Validate booking data and return cleaned data or raise ValidationError.
    """
    schema = BookingSchema()
    return schema.load(data)


def validate_registration_data(data: dict) -> dict:
    """
    Validate registration data and return cleaned data or raise ValidationError.
    """
    schema = UserRegistrationSchema()
    return schema.load(data)


def validate_flight_data(data: dict) -> dict:
    """
    Validate flight data and return cleaned data or raise ValidationError.
    """
    schema = FlightCreateSchema()
    return schema.load(data)
