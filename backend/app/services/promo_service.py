class PromoService:
    PROMOS = {
        'SUMMER2026': {'type': 'percent', 'value': 10},
        'HAWA50': {'type': 'flat', 'value': 500},
        'FIRSTFLY': {'type': 'percent', 'value': 15},
        'PRO': {'type': 'percent', 'value': 5}
    }

    @staticmethod
    def validate_promo(code):
        if not code:
            return None
        return PromoService.PROMOS.get(code.upper())

    @staticmethod
    def calculate_discount(price, code):
        promo = PromoService.validate_promo(code)
        if not promo:
            return 0
        
        if promo['type'] == 'percent':
            return price * (promo['value'] / 100)
        elif promo['type'] == 'flat':
            return promo['value']
        
        return 0
