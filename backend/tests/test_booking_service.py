import pytest
from app.services import BookingService

def test_calculate_pricing_simple():
    # Base price 100, Economy, no extras
    pricing = BookingService.calculate_pricing_breakdown(
        flight_price=100.0,
        seat_class='Economy'
    )
    
    amount = 100.0
    tax = amount * 0.18
    total = amount + tax
    
    assert pricing['base_seat_price'] == 100.0
    assert pricing['taxes'] == tax
    assert pricing['total_price'] == total

def test_calculate_pricing_business_class():
    # Base 100, Business (1.5x)
    pricing = BookingService.calculate_pricing_breakdown(
        flight_price=100.0,
        seat_class='Business'
    )
    
    base = 150.0  # 100 * 1.5
    tax = base * 0.18
    total = base + tax
    
    assert pricing['base_seat_price'] == 150.0
    assert pricing['total_price'] == total

def test_calculate_pricing_with_extras():
    # Base 100, Economy
    # Meal: 20
    # Baggage 20kg: 20
    # Insurance: 15
    
    pricing = BookingService.calculate_pricing_breakdown(
        flight_price=100.0,
        seat_class='Economy',
        meal_price=20.0,
        baggage_kg=20,
        has_insurance=True
    )
    
    subtotal = 100.0 + 20.0 + 20.0 + 15.0 # 155
    tax = 155.0 * 0.18
    total = 155.0 + tax
    
    assert pricing['extras_price'] == 35.0 # 20 (bag) + 15 (ins)
    assert pricing['meal_price'] == 20.0
    assert pricing['taxes'] == tax
    assert pricing['total_price'] == total
