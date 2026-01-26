"""
Service layer for flight search and retrieval operations.
"""
from typing import List, Dict, Any, Optional
from app.models.flight import Flight
from app.models.airport import Airport
from app import db
from datetime import datetime, timedelta


class FlightService:
    """Service class for handling flight-related operations."""
    
    @staticmethod
    def search_flights(
        origin_code: str,
        destination_code: str,
        date_str: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for flights between two airports on a given date.
        
        Supports both direct flights and connecting flights with one stop.
        
        Args:
            origin_code: IATA code of origin airport (e.g., "JFK")
            destination_code: IATA code of destination airport (e.g., "LHR")
            date_str: Date string in 'YYYY-MM-DD' format
            filters: Optional filters dict with keys:
                - min_price: Minimum total price
                - max_price: Maximum total price
                - stops: 'direct', '1_stop', or None for any
                
        Returns:
            List of itinerary dictionaries, each containing:
                - type: 'direct' or 'connecting'
                - flights: List of Flight objects
                - total_price: Combined price of all flights
        """
        # Parse date string
        try:
            search_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return []
            
        filters = filters or {}
        min_price = filters.get('min_price')
        max_price = filters.get('max_price')
        stops = filters.get('stops')  # 'direct', '1_stop', or None (any)

        results: List[Dict[str, Any]] = []

        # 1. Direct Flights
        if stops != '1_stop':
            direct_flights = Flight.query.filter(
                Flight.origin_code == origin_code,
                Flight.destination_code == destination_code,
            ).all()
            
            for f in direct_flights:
                if f.departure_time.date() == search_date and f.status != 'Canceled':
                    if min_price and f.price < float(min_price):
                        continue
                    if max_price and f.price > float(max_price):
                        continue
                    
                    results.append({
                        'type': 'direct',
                        'flights': [f],
                        'total_price': f.price
                    })

        # 2. Connecting Flights (1 Stop)
        if stops != 'direct':
            possible_leg1 = Flight.query.filter(
                Flight.origin_code == origin_code,
                Flight.departure_time >= datetime.combine(search_date, datetime.min.time()),
                Flight.departure_time <= datetime.combine(search_date, datetime.max.time())
            ).all()
    
            for leg1 in possible_leg1:
                if leg1.status == 'Canceled':
                    continue
                    
                # Find leg2: Intermediate -> Destination
                # Constraint: leg2 departure must be between leg1 arrival + 1h and + 12h
                min_layover = leg1.arrival_time + timedelta(hours=1)
                max_layover = leg1.arrival_time + timedelta(hours=12)
    
                leg2_candidates = Flight.query.filter(
                    Flight.origin_code == leg1.destination_code,
                    Flight.destination_code == destination_code,
                    Flight.departure_time >= min_layover,
                    Flight.departure_time <= max_layover
                ).all()
    
                for leg2 in leg2_candidates:
                    if leg2.status != 'Canceled':
                        total_price = leg1.price + leg2.price
                        if min_price and total_price < float(min_price):
                            continue
                        if max_price and total_price > float(max_price):
                            continue

                        results.append({
                            'type': 'connecting',
                            'flights': [leg1, leg2],
                            'total_price': total_price
                        })

        return results

    @staticmethod
    def get_all_flights() -> List[Flight]:
        """
        Get all flights in the system.
        
        Returns:
            List of all Flight objects
        """
        return Flight.query.all()

    @staticmethod
    def get_flight_by_id(flight_id: int) -> Optional[Flight]:
        """
        Get a specific flight by its ID.
        
        Args:
            flight_id: The flight's database ID
            
        Returns:
            The Flight object if found, None otherwise
        """
        return Flight.query.get(flight_id)
