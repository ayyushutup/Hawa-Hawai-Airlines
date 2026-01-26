import random

class WeatherService:
    # Simulating weather conditions
    CONDITIONS = ['Sunny', 'Rainy', 'Stormy', 'Cloudy', 'Snowy']
    
    @staticmethod
    def get_weather_factor(airport_code):
        # In a real app, this would fetch from an API
        # Here we mock it.
        condition = random.choice(WeatherService.CONDITIONS)
        
        # If weather is bad, demand might drop -> lower price? 
        # OR bad weather means higher operating costs/risk -> higher price?
        # Let's assume bad weather = less demand = lower price to encourage booking
        # OR scarcity of flights? 
        # User prompt: "integrate prices change with seat availabilty and weather"
        # Let's simple model:
        # Sunny/Cloudy: 1.0
        # Rainy: 0.9
        # Stormy: 0.8
        # Snowy: 0.85
        
        if condition in ['Sunny', 'Cloudy']:
            return 1.0
        elif condition == 'Rainy':
            return 0.9
        elif condition == 'Stormy':
            return 0.8
        elif condition == 'Snowy':
            return 0.85
        return 1.0
