# ✈️ Hawa Hawai Airlines

> "The sky is not the limit; it's just the beginning of your journey."

Welcome to **Hawa Hawai Airlines**, a comprehensive, modern, and fully-featured airline booking and management platform. We built this system to mimic the real-world complexities of an airline ecosystem—from dynamic pricing based on weather and demand, to interactive seat selection and live flight tracking. 

Whether you're looking to book a luxury First Class ticket from Mumbai to New York or checking if your connecting flight in London is delayed, Hawa Hawai provides a seamless, premium experience.

## ✨ Why Hawa Hawai?
Most demo booking platforms just let you pick a flight and click "book." Hawa Hawai goes deeper:
- **Dynamic Pricing Engine**: Just like real airlines, our prices fluctuate! Our algorithm automatically adjusts ticket costs based on occupancy rates, time to departure, and even real-world factors. 
- **Interactive Experiences**: Choose your seat visually on a dedicated SeatMap, pick your meal preferences (Vegan, Gluten-Free, or Standard), and add extra baggage or priority boarding before checkout.
- **Live Flight Tracking**: Watch your flights move across the globe on an interactive Leaflet map.
- **Admin Control Center**: A dedicated dashboard for airline staff to track revenue statistics, manage flight schedules, and analyze passenger manifests.
- **Simulated Realism**: Included seed scripts generate thousands of realistic flights across major Indian hubs (DEL, BOM) and international destinations, complete with mock passenger bookings, cancellations, and delays.

## 🚀 Technology Stack
We didn't cut corners on the architecture. Hawa Hawai is a production-ready system powered by:

### **Frontend (The Passenger Experience)**
- **React 19 & Vite**: Lightning-fast UI rendering and development.
- **TailwindCSS**: Beautiful, responsive, utility-first styling.
- **Leaflet**: Fully interactive map visualizations.

### **Backend (The Control Tower)**
- **Python & Flask**: A robust, scalable RESTful API.
- **PostgreSQL & SQLAlchemy**: Relational data integrity for flights, bookings, and users.
- **Redis**: Caching layer for caching flight searches and managing rate limits.
- **Flask-JWT-Extended**: Secure, stateless authentication for both passengers and admins.

## ⚙️ Getting Started (Local Flight Check-In)

Ready to launch the airline on your local machine?

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed the database with flights
flask db upgrade
python seed.py

# Start the server
python run.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and start booking your first flight!

## 📖 Complete Documentation
For an in-depth look at our database schemas, API endpoints, services, and authentication flows, check out our [Technical Documentation](./TECH_DOCUMENTATION.md).

---
*Built with ❤️ for a frictionless travel experience.*
