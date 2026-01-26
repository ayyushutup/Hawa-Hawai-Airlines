from app.models.promo_code import PromoCode

class PromoService:
    @staticmethod
    def validate_promo(code):
        if not code:
            return None
        return PromoCode.query.filter_by(code=code.upper(), is_active=True).first()

    @staticmethod
    def calculate_discount(price, code):
        promo = PromoService.validate_promo(code)
        if not promo:
            return 0
        
        # Check validity (dates, min amount, etc)
        is_valid, msg = promo.is_valid(price)
        if not is_valid:
            return 0
            
        discounted_amount, discount = promo.apply_discount(price)
        return discount

