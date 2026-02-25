# NairobiJetHouse — Private Aviation & Yacht Charter Platform

A full-stack luxury travel platform for private jet bookings, yacht charters, and asset leasing. **No user accounts required** — guests can book, inquire, and track entirely without registering.

---

## Project Structure

```
NairobiJetHouse/
├── backend/                    # Django REST API
│   ├── requirements.txt
│   ├── NairobiJetHouse/              # Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── flights/                # Main app
│       ├── models.py           # All data models
│       ├── serializers.py      # DRF serializers
│       ├── views.py            # ViewSets + API views
│       └── urls.py             # App URL routing
│
└── frontend/                   # React + Vite
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx            # Entry point
        ├── App.jsx             # Router + layout
        ├── services/
        │   └── api.js          # All API calls
        ├── styles/
        │   └── global.css      # Design system + global styles
        ├── components/
        │   ├── Navbar.jsx      # Fixed navbar with scroll effect
        │   ├── Footer.jsx      # Site footer
        │   └── AirportSearch.jsx  # Autocomplete airport picker
        └── pages/
            ├── Home.jsx        # Landing page
            ├── FlightBooking.jsx   # Airport-to-airport booking form
            ├── FlightInquiry.jsx   # General flight inquiry form
            ├── YachtCharter.jsx    # Yacht charter request
            ├── Leasing.jsx         # Aircraft/yacht lease inquiry
            ├── Fleet.jsx           # Browse all assets
            └── TrackBooking.jsx    # Track by reference or email
```

---

## Features

### Guest-First Design (No Login Required)
- All services accessible without creating an account
- UUID-based booking references for tracking
- Email-based booking lookup

### Services
| Service | Endpoint | Description |
|---|---|---|
| Flight Booking | `/book-flight` | Specific airport-to-airport, one-way/return/multi-leg |
| Flight Inquiry | `/flight-inquiry` | Open-ended exploration, flexible dates |
| Yacht Charter | `/yacht-charter` | Day/week/season yacht charter |
| Leasing | `/leasing` | Long-term aircraft or yacht lease |
| Fleet Browser | `/fleet` | Filter and browse all assets |
| Booking Tracker | `/track` | Status check by reference or email |

---

## Backend Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (or SQLite for dev)

### Installation

```bash
cd backend

# Create virtualenv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env or export)
export SECRET_KEY="your-secret-key"
export DB_NAME="NairobiJetHouse_db"
export DB_USER="postgres"
export DB_PASSWORD="yourpassword"

# For quick dev with SQLite, edit settings.py to use SQLite (see comment in settings.py)

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run dev server
python manage.py runserver
```

### API Endpoints

Base URL: `http://localhost:8000/api/v1/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/airports/?search=jfk` | Search airports |
| GET | `/aircraft/?category=heavy` | List/filter aircraft |
| GET | `/yachts/?size_category=superyacht` | List/filter yachts |
| POST | `/flight-bookings/` | Create flight booking |
| GET | `/flight-bookings/track/{uuid}/` | Track flight booking |
| GET | `/flight-bookings/?email=x@x.com` | List bookings by email |
| POST | `/yacht-charters/` | Create yacht charter |
| GET | `/yacht-charters/track/{uuid}/` | Track charter |
| POST | `/lease-inquiries/` | Submit lease inquiry |
| POST | `/flight-inquiries/` | Submit general inquiry |
| POST | `/quick-quote/` | Get rough price estimate |

### Admin Panel

Visit `http://localhost:8000/admin/` to manage all bookings, assets, and airports.

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Installation

```bash
cd frontend

npm install

# Configure API URL (optional — defaults to http://localhost:8000/api/v1)
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist — serve with any static host (Netlify, Vercel, Nginx)
```

---

## Design System

The frontend uses a **luxury dark theme** with:
- **Colors**: Obsidian black `#0A0A0A`, Champagne gold `#C9A84C`, Ivory `#F5F0E8`
- **Typography**: Cormorant Garamond (display/headings) + Montserrat (body)
- **No UI framework** — pure CSS custom properties for full control

---

## Seeding Sample Data

Run in Django shell (`python manage.py shell`):

```python
from flights.models import Airport, Aircraft, Yacht

# Sample airports
Airport.objects.create(code='JFK', name='John F. Kennedy International', city='New York', country='USA', latitude=40.6413, longitude=-73.7781)
Airport.objects.create(code='LHR', name='Heathrow Airport', city='London', country='UK', latitude=51.4700, longitude=-0.4543)
Airport.objects.create(code='CDG', name='Charles de Gaulle Airport', city='Paris', country='France', latitude=49.0097, longitude=2.5479)
Airport.objects.create(code='DXB', name='Dubai International', city='Dubai', country='UAE', latitude=25.2532, longitude=55.3657)

# Sample aircraft
Aircraft.objects.create(name='Citation CJ4', model='Cessna Citation CJ4', category='light', passenger_capacity=8, range_km=3200, cruise_speed_kmh=778, hourly_rate_usd=4500)
Aircraft.objects.create(name='Gulfstream G550', model='Gulfstream G550', category='heavy', passenger_capacity=14, range_km=12500, cruise_speed_kmh=956, hourly_rate_usd=12000)
Aircraft.objects.create(name='Global 7500', model='Bombardier Global 7500', category='ultra_long', passenger_capacity=19, range_km=14260, cruise_speed_kmh=956, hourly_rate_usd=18000)

# Sample yacht
Yacht.objects.create(name='Ocean Rhapsody', size_category='superyacht', length_meters=72, guest_capacity=12, crew_count=14, daily_rate_usd=85000, home_port='Monaco')
```

---

## Production Deployment

### Backend (Django)
- Set `DEBUG=False` and proper `ALLOWED_HOSTS` in environment
- Run with Gunicorn: `gunicorn NairobiJetHouse.wsgi:application`
- Use Nginx as reverse proxy
- Configure proper CORS origins in settings

### Frontend (React)
- `npm run build` and serve `/dist` as static files
- Or deploy to Vercel/Netlify with env var `VITE_API_URL` pointing to your Django server

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL (SQLite for dev) |
| API | RESTful JSON API |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Pure CSS (custom design system) |
| Fonts | Google Fonts (Cormorant Garamond + Montserrat) |

---

*NairobiJetHouse — Elevating Every Journey*