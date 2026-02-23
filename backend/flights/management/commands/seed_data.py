"""
VistaJets Seed Data Management Command
Usage: python manage.py seed_data
       python manage.py seed_data --clear   (wipe existing data first)
       python manage.py seed_data --only airports
       python manage.py seed_data --only aircraft
       python manage.py seed_data --only yachts
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from flights.models import Airport, Aircraft, Yacht
from decimal import Decimal


# ──────────────────────────────────────────────────────────────────────────────
# AIRPORTS  (80 real private-aviation hubs worldwide)
# ──────────────────────────────────────────────────────────────────────────────
AIRPORTS = [
    # ── North America ──────────────────────────────────────────────────────────
    {"code": "JFK",  "name": "John F. Kennedy International Airport",     "city": "New York",        "country": "USA",        "latitude": 40.6413,   "longitude": -73.7781},
    {"code": "TEB",  "name": "Teterboro Airport",                         "city": "Teterboro",       "country": "USA",        "latitude": 40.8501,   "longitude": -74.0608},
    {"code": "VNY",  "name": "Van Nuys Airport",                          "city": "Los Angeles",     "country": "USA",        "latitude": 34.2098,   "longitude": -118.4898},
    {"code": "LAX",  "name": "Los Angeles International Airport",         "city": "Los Angeles",     "country": "USA",        "latitude": 33.9425,   "longitude": -118.4081},
    {"code": "MIA",  "name": "Miami International Airport",               "city": "Miami",           "country": "USA",        "latitude": 25.7959,   "longitude": -80.2870},
    {"code": "OPF",  "name": "Miami-Opa Locka Executive Airport",         "city": "Miami",           "country": "USA",        "latitude": 25.9070,   "longitude": -80.2784},
    {"code": "ORD",  "name": "O'Hare International Airport",              "city": "Chicago",         "country": "USA",        "latitude": 41.9742,   "longitude": -87.9073},
    {"code": "MDW",  "name": "Chicago Midway International Airport",      "city": "Chicago",         "country": "USA",        "latitude": 41.7868,   "longitude": -87.7522},
    {"code": "DFW",  "name": "Dallas/Fort Worth International Airport",   "city": "Dallas",          "country": "USA",        "latitude": 32.8998,   "longitude": -97.0403},
    {"code": "HOU",  "name": "William P. Hobby Airport",                  "city": "Houston",         "country": "USA",        "latitude": 29.6454,   "longitude": -95.2789},
    {"code": "SFO",  "name": "San Francisco International Airport",       "city": "San Francisco",   "country": "USA",        "latitude": 37.6213,   "longitude": -122.3790},
    {"code": "SQL",  "name": "San Carlos Airport",                        "city": "San Carlos",      "country": "USA",        "latitude": 37.5119,   "longitude": -122.2497},
    {"code": "BOS",  "name": "Boston Logan International Airport",        "city": "Boston",          "country": "USA",        "latitude": 42.3656,   "longitude": -71.0096},
    {"code": "BED",  "name": "Hanscom Field",                             "city": "Bedford",         "country": "USA",        "latitude": 42.4700,   "longitude": -71.2890},
    {"code": "IAD",  "name": "Washington Dulles International Airport",   "city": "Washington D.C.", "country": "USA",        "latitude": 38.9531,   "longitude": -77.4565},
    {"code": "LAS",  "name": "Harry Reid International Airport",          "city": "Las Vegas",       "country": "USA",        "latitude": 36.0840,   "longitude": -115.1537},
    {"code": "HND",  "name": "Henderson Executive Airport",               "city": "Las Vegas",       "country": "USA",        "latitude": 35.9728,   "longitude": -115.1340},
    {"code": "SEA",  "name": "Seattle-Tacoma International Airport",      "city": "Seattle",         "country": "USA",        "latitude": 47.4502,   "longitude": -122.3088},
    {"code": "BFI",  "name": "King County International Airport (Boeing)","city": "Seattle",         "country": "USA",        "latitude": 47.5300,   "longitude": -122.3019},
    {"code": "ATL",  "name": "Hartsfield-Jackson Atlanta International",  "city": "Atlanta",         "country": "USA",        "latitude": 33.6407,   "longitude": -84.4277},
    {"code": "PDK",  "name": "DeKalb-Peachtree Airport",                  "city": "Atlanta",         "country": "USA",        "latitude": 33.8756,   "longitude": -84.3020},
    {"code": "DEN",  "name": "Denver International Airport",              "city": "Denver",          "country": "USA",        "latitude": 39.8561,   "longitude": -104.6737},
    {"code": "APA",  "name": "Centennial Airport",                        "city": "Denver",          "country": "USA",        "latitude": 39.5701,   "longitude": -104.8491},
    {"code": "MCO",  "name": "Orlando International Airport",             "city": "Orlando",         "country": "USA",        "latitude": 28.4312,   "longitude": -81.3081},
    {"code": "PBI",  "name": "Palm Beach International Airport",          "city": "Palm Beach",      "country": "USA",        "latitude": 26.6832,   "longitude": -80.0956},
    {"code": "EYW",  "name": "Key West International Airport",            "city": "Key West",        "country": "USA",        "latitude": 24.5561,   "longitude": -81.7596},
    {"code": "ASP",  "name": "Aspen/Pitkin County Airport",               "city": "Aspen",           "country": "USA",        "latitude": 39.2232,   "longitude": -106.8688},
    {"code": "SUN",  "name": "Friedman Memorial Airport",                 "city": "Sun Valley",      "country": "USA",        "latitude": 43.5044,   "longitude": -114.2964},
    {"code": "HPN",  "name": "Westchester County Airport",                "city": "White Plains",    "country": "USA",        "latitude": 41.0670,   "longitude": -73.7076},
    {"code": "YYZ",  "name": "Toronto Pearson International Airport",     "city": "Toronto",         "country": "Canada",     "latitude": 43.6777,   "longitude": -79.6248},
    {"code": "YUL",  "name": "Montréal-Trudeau International Airport",   "city": "Montreal",        "country": "Canada",     "latitude": 45.4706,   "longitude": -73.7408},
    {"code": "YVR",  "name": "Vancouver International Airport",           "city": "Vancouver",       "country": "Canada",     "latitude": 49.1947,   "longitude": -123.1792},
    {"code": "MEX",  "name": "Benito Juárez International Airport",       "city": "Mexico City",     "country": "Mexico",     "latitude": 19.4363,   "longitude": -99.0721},
    {"code": "CUN",  "name": "Cancún International Airport",              "city": "Cancún",          "country": "Mexico",     "latitude": 21.0365,   "longitude": -86.8770},

    # ── Europe ─────────────────────────────────────────────────────────────────
    {"code": "LHR",  "name": "London Heathrow Airport",                   "city": "London",          "country": "UK",         "latitude": 51.4700,   "longitude": -0.4543},
    {"code": "LCY",  "name": "London City Airport",                       "city": "London",          "country": "UK",         "latitude": 51.5053,   "longitude": 0.0553},
    {"code": "FAB",  "name": "Farnborough Airport",                       "city": "Farnborough",     "country": "UK",         "latitude": 51.2776,   "longitude": -0.7762},
    {"code": "CDG",  "name": "Paris Charles de Gaulle Airport",           "city": "Paris",           "country": "France",     "latitude": 49.0097,   "longitude": 2.5479},
    {"code": "LBG",  "name": "Paris Le Bourget Airport",                  "city": "Paris",           "country": "France",     "latitude": 48.9694,   "longitude": 2.4414},
    {"code": "NCE",  "name": "Nice Côte d'Azur Airport",                  "city": "Nice",            "country": "France",     "latitude": 43.6584,   "longitude": 7.2159},
    {"code": "TXL",  "name": "Berlin Brandenburg Airport",                "city": "Berlin",          "country": "Germany",    "latitude": 52.3667,   "longitude": 13.5033},
    {"code": "MUC",  "name": "Munich Airport",                            "city": "Munich",          "country": "Germany",    "latitude": 48.3537,   "longitude": 11.7750},
    {"code": "FRA",  "name": "Frankfurt Airport",                         "city": "Frankfurt",       "country": "Germany",    "latitude": 50.0379,   "longitude": 8.5622},
    {"code": "ZRH",  "name": "Zurich Airport",                            "city": "Zurich",          "country": "Switzerland","latitude": 47.4582,   "longitude": 8.5555},
    {"code": "GVA",  "name": "Geneva Airport",                            "city": "Geneva",          "country": "Switzerland","latitude": 46.2381,   "longitude": 6.1089},
    {"code": "AMS",  "name": "Amsterdam Schiphol Airport",                "city": "Amsterdam",       "country": "Netherlands","latitude": 52.3105,   "longitude": 4.7683},
    {"code": "MAD",  "name": "Adolfo Suárez Madrid-Barajas Airport",     "city": "Madrid",          "country": "Spain",      "latitude": 40.4936,   "longitude": -3.5668},
    {"code": "BCN",  "name": "Josep Tarradellas Barcelona-El Prat Airport","city": "Barcelona",      "country": "Spain",      "latitude": 41.2971,   "longitude": 2.0785},
    {"code": "IBZ",  "name": "Ibiza Airport",                             "city": "Ibiza",           "country": "Spain",      "latitude": 38.8729,   "longitude": 1.3731},
    {"code": "PMI",  "name": "Palma de Mallorca Airport",                 "city": "Palma",           "country": "Spain",      "latitude": 39.5517,   "longitude": 2.7388},
    {"code": "FCO",  "name": "Rome Fiumicino Airport",                    "city": "Rome",            "country": "Italy",      "latitude": 41.8003,   "longitude": 12.2389},
    {"code": "MXP",  "name": "Milan Malpensa Airport",                    "city": "Milan",           "country": "Italy",      "latitude": 45.6306,   "longitude": 8.7281},
    {"code": "VCE",  "name": "Venice Marco Polo Airport",                 "city": "Venice",          "country": "Italy",      "latitude": 45.5053,   "longitude": 12.3519},
    {"code": "OLB",  "name": "Olbia Costa Smeralda Airport",              "city": "Olbia",           "country": "Italy",      "latitude": 40.8987,   "longitude": 9.5176},
    {"code": "ATH",  "name": "Athens International Airport",              "city": "Athens",          "country": "Greece",     "latitude": 37.9364,   "longitude": 23.9445},
    {"code": "JTR",  "name": "Santorini (Thira) Airport",                 "city": "Santorini",       "country": "Greece",     "latitude": 36.3992,   "longitude": 25.4793},
    {"code": "JMK",  "name": "Mykonos Island National Airport",           "city": "Mykonos",         "country": "Greece",     "latitude": 37.4351,   "longitude": 25.3481},
    {"code": "HER",  "name": "Heraklion International Airport",           "city": "Crete",           "country": "Greece",     "latitude": 35.3397,   "longitude": 25.1803},
    {"code": "SVO",  "name": "Sheremetyevo International Airport",        "city": "Moscow",          "country": "Russia",     "latitude": 55.9726,   "longitude": 37.4146},
    {"code": "VKO",  "name": "Vnukovo International Airport",             "city": "Moscow",          "country": "Russia",     "latitude": 55.5915,   "longitude": 37.2615},

    # ── Middle East & Africa ───────────────────────────────────────────────────
    {"code": "DXB",  "name": "Dubai International Airport",               "city": "Dubai",           "country": "UAE",        "latitude": 25.2532,   "longitude": 55.3657},
    {"code": "DWC",  "name": "Al Maktoum International Airport",          "city": "Dubai",           "country": "UAE",        "latitude": 24.8963,   "longitude": 55.1612},
    {"code": "AUH",  "name": "Abu Dhabi International Airport",           "city": "Abu Dhabi",       "country": "UAE",        "latitude": 24.4330,   "longitude": 54.6511},
    {"code": "DOH",  "name": "Hamad International Airport",               "city": "Doha",            "country": "Qatar",      "latitude": 25.2731,   "longitude": 51.6081},
    {"code": "RUH",  "name": "King Khalid International Airport",         "city": "Riyadh",          "country": "Saudi Arabia","latitude": 24.9578,   "longitude": 46.6988},
    {"code": "JED",  "name": "King Abdulaziz International Airport",      "city": "Jeddah",          "country": "Saudi Arabia","latitude": 21.6796,   "longitude": 39.1565},
    {"code": "TLV",  "name": "Ben Gurion International Airport",          "city": "Tel Aviv",        "country": "Israel",     "latitude": 32.0114,   "longitude": 34.8867},
    {"code": "CAI",  "name": "Cairo International Airport",               "city": "Cairo",           "country": "Egypt",      "latitude": 30.1219,   "longitude": 31.4056},
    {"code": "CPT",  "name": "Cape Town International Airport",           "city": "Cape Town",       "country": "South Africa","latitude": -33.9715,  "longitude": 18.6021},
    {"code": "JNB",  "name": "O.R. Tambo International Airport",          "city": "Johannesburg",    "country": "South Africa","latitude": -26.1392,  "longitude": 28.2460},
    {"code": "MBA",  "name": "Moi International Airport",                 "city": "Mombasa",         "country": "Kenya",      "latitude": -4.0348,   "longitude": 39.5942},

    # ── Asia-Pacific ───────────────────────────────────────────────────────────
    {"code": "HKG",  "name": "Hong Kong International Airport",           "city": "Hong Kong",       "country": "Hong Kong",  "latitude": 22.3080,   "longitude": 113.9185},
    {"code": "SIN",  "name": "Singapore Changi Airport",                  "city": "Singapore",       "country": "Singapore",  "latitude": 1.3644,    "longitude": 103.9915},
    {"code": "NRT",  "name": "Tokyo Narita International Airport",        "city": "Tokyo",           "country": "Japan",      "latitude": 35.7719,   "longitude": 140.3929},
    {"code": "HND",  "name": "Tokyo Haneda Airport",                      "city": "Tokyo",           "country": "Japan",      "latitude": 35.5493,   "longitude": 139.7798},
    {"code": "SYD",  "name": "Sydney Kingsford Smith Airport",            "city": "Sydney",          "country": "Australia",  "latitude": -33.9399,  "longitude": 151.1753},
    {"code": "MEL",  "name": "Melbourne Airport",                         "city": "Melbourne",       "country": "Australia",  "latitude": -37.6690,  "longitude": 144.8410},
    {"code": "BKK",  "name": "Suvarnabhumi Airport",                      "city": "Bangkok",         "country": "Thailand",   "latitude": 13.6811,   "longitude": 100.7475},
    {"code": "PQC",  "name": "Phu Quoc International Airport",            "city": "Phu Quoc",        "country": "Vietnam",    "latitude": 10.2270,   "longitude": 103.9673},
    {"code": "MLE",  "name": "Velana International Airport",              "city": "Malé",            "country": "Maldives",   "latitude": 4.1918,    "longitude": 73.5290},
    {"code": "BOM",  "name": "Chhatrapati Shivaji Maharaj International", "city": "Mumbai",          "country": "India",      "latitude": 19.0896,   "longitude": 72.8656},
    {"code": "DEL",  "name": "Indira Gandhi International Airport",       "city": "New Delhi",       "country": "India",      "latitude": 28.5562,   "longitude": 77.1000},
]


# ──────────────────────────────────────────────────────────────────────────────
# AIRCRAFT  (real models with accurate specs)
# ──────────────────────────────────────────────────────────────────────────────
AIRCRAFT = [

    # ── Light Jets ─────────────────────────────────────────────────────────────
    {
        "name": "Cessna Citation CJ4",
        "model": "Citation CJ4",
        "category": "light",
        "passenger_capacity": 8,
        "range_km": 3204,
        "cruise_speed_kmh": 778,
        "hourly_rate_usd": Decimal("4200"),
        "description": "The pinnacle of the CJ family, offering a transcontinental light jet experience. Features a flat-floor cabin with stand-up headroom and exceptional fuel efficiency for trips up to 1,700 nm.",
        "amenities": ["WiFi", "Leather seating", "Refreshment center", "Enclosed lavatory", "Baggage access in-flight"],
        "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    },
    {
        "name": "Embraer Phenom 300E",
        "model": "Phenom 300E",
        "category": "light",
        "passenger_capacity": 7,
        "range_km": 3650,
        "cruise_speed_kmh": 834,
        "hourly_rate_usd": Decimal("4800"),
        "description": "World's best-selling light jet for over a decade. The 300E combines stunning interior design with performance that rivals midsize jets, including the fastest speed in its class.",
        "amenities": ["HD entertainment", "WiFi", "Dual-zone temperature control", "Enclosed lavatory", "Full leather interior"],
        "image_url": "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
    },
    {
        "name": "HondaJet Elite II",
        "model": "HondaJet Elite II",
        "category": "light",
        "passenger_capacity": 6,
        "range_km": 2661,
        "cruise_speed_kmh": 782,
        "hourly_rate_usd": Decimal("3800"),
        "description": "Honda's revolutionary over-the-wing engine mount design delivers the quietest, most fuel-efficient cabin in the light jet segment, with a surprisingly spacious interior.",
        "amenities": ["Quietest cabin in class", "Refreshment center", "Lavatory", "Leather seating", "WiFi"],
        "image_url": "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=800&q=80",
    },
    {
        "name": "Pilatus PC-24",
        "model": "PC-24 Super Versatile Jet",
        "category": "light",
        "passenger_capacity": 10,
        "range_km": 3580,
        "cruise_speed_kmh": 815,
        "hourly_rate_usd": Decimal("5100"),
        "description": "The world's first Super Versatile Jet. Can operate from unpaved, short, or high-altitude runways — opening up destinations no other jet can reach — while maintaining a premium cabin.",
        "amenities": ["Short runway capability", "WiFi", "Large cargo door", "Club seating", "Refreshment center"],
        "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
    },

    # ── Midsize Jets ───────────────────────────────────────────────────────────
    {
        "name": "Hawker 900XP",
        "model": "Hawker 900XP",
        "category": "midsize",
        "passenger_capacity": 9,
        "range_km": 5190,
        "cruise_speed_kmh": 841,
        "hourly_rate_usd": Decimal("6500"),
        "description": "A British classic with the longest range in the midsize category. The 900XP's stand-up cabin, true galley, and separate lavatory make transatlantic positioning viable for a midsize aircraft.",
        "amenities": ["Stand-up cabin", "Full galley", "DVD entertainment", "Enclosed lavatory", "Separate crew area"],
        "image_url": "https://images.unsplash.com/photo-1513449328-09091f03d6f0?w=800&q=80",
    },
    {
        "name": "Cessna Citation Latitude",
        "model": "Citation Latitude",
        "category": "midsize",
        "passenger_capacity": 9,
        "range_km": 4630,
        "cruise_speed_kmh": 851,
        "hourly_rate_usd": Decimal("7000"),
        "description": "Designed from the ground up with passenger comfort as the priority. Features the widest and tallest cabin in its class, a true flat floor, and a fully enclosed aft lavatory with vanity.",
        "amenities": ["Widest cabin in class", "Flat floor", "WiFi", "Full galley", "Enclosed lavatory with vanity"],
        "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    },
    {
        "name": "Embraer Legacy 450",
        "model": "Legacy 450",
        "category": "midsize",
        "passenger_capacity": 8,
        "range_km": 4630,
        "cruise_speed_kmh": 870,
        "hourly_rate_usd": Decimal("7200"),
        "description": "Fly-by-wire technology in a midsize jet brings unmatched handling precision. The Legacy 450 offers stand-up headroom throughout, a full flat-bed configuration, and a revolutionary full cabin.",
        "amenities": ["Fly-by-wire", "Full flat-bed seating", "Stand-up cabin", "WiFi", "Enclosed lavatory"],
        "image_url": "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
    },

    # ── Super Midsize Jets ─────────────────────────────────────────────────────
    {
        "name": "Bombardier Challenger 350",
        "model": "Challenger 350",
        "category": "super_midsize",
        "passenger_capacity": 10,
        "range_km": 5926,
        "cruise_speed_kmh": 870,
        "hourly_rate_usd": Decimal("9800"),
        "description": "The market-defining super midsize jet. The Challenger 350 combines coast-to-coast nonstop capability with a remarkably wide cabin, best-in-class baggage, and industry-leading reliability.",
        "amenities": ["WiFi", "Entertainment system", "Full galley", "Stand-up cabin", "Enclosed lavatory", "Club and lounge seating"],
        "image_url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80",
    },
    {
        "name": "Gulfstream G280",
        "model": "G280",
        "category": "super_midsize",
        "passenger_capacity": 10,
        "range_km": 6667,
        "cruise_speed_kmh": 900,
        "hourly_rate_usd": Decimal("10500"),
        "description": "Gulfstream's entry into the super midsize market combines the brand's legendary aviation DNA with a cabin that sets the benchmark. The longest range in its class enables unprecedented nonstop routes.",
        "amenities": ["Gulfstream cabin air quality", "WiFi", "Advanced avionics", "Full galley", "Enclosed lavatory"],
        "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
    },
    {
        "name": "Dassault Falcon 2000LXS",
        "model": "Falcon 2000LXS",
        "category": "super_midsize",
        "passenger_capacity": 10,
        "range_km": 7408,
        "cruise_speed_kmh": 870,
        "hourly_rate_usd": Decimal("11000"),
        "description": "The Falcon 2000LXS is the only aircraft in its class capable of accessing demanding short-field airports like London City while delivering intercontinental range — a truly unique capability.",
        "amenities": ["Short-field capability", "EasyLink WiFi", "Falcon Eye HUD", "Full galley", "Lounge configuration", "DVD/entertainment"],
        "image_url": "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=800&q=80",
    },

    # ── Heavy Jets ─────────────────────────────────────────────────────────────
    {
        "name": "Gulfstream G550",
        "model": "G550",
        "category": "heavy",
        "passenger_capacity": 16,
        "range_km": 12501,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("13500"),
        "description": "One of the most trusted heavy jets ever built, the G550 has transported heads of state and business leaders around the globe for two decades. With 6,750 nm of range, it connects almost any city pair nonstop.",
        "amenities": ["PlaneView cockpit", "WiFi", "Full galley & crew rest", "Master stateroom", "Shower", "3-zone cabin", "Entertainment system"],
        "image_url": "https://images.unsplash.com/photo-1513449328-09091f03d6f0?w=800&q=80",
    },
    {
        "name": "Bombardier Global 5500",
        "model": "Global 5500",
        "category": "heavy",
        "passenger_capacity": 16,
        "range_km": 9630,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("14000"),
        "description": "Redesigned from the ground up with Bombardier's Nuage seating — the most ergonomic seat in aviation history. The Global 5500 redefines cabin comfort at 51,000 ft.",
        "amenities": ["Nuage seating", "Circadian lighting", "Low cabin altitude (5,800 ft)", "WiFi", "Full galley", "Master suite", "3 living areas"],
        "image_url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80",
    },
    {
        "name": "Dassault Falcon 8X",
        "model": "Falcon 8X",
        "category": "heavy",
        "passenger_capacity": 16,
        "range_km": 11945,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("15000"),
        "description": "Three engines. 11,450 km of range. The Falcon 8X connects Dubai to New York, London to Singapore, and virtually any global city pair while delivering the quiet refinement Dassault is celebrated for.",
        "amenities": ["Trijet reliability", "30+ window configuration", "FalconCabin WiFi", "Master stateroom", "Full galley", "Lounge areas"],
        "image_url": "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
    },
    {
        "name": "Boeing Business Jet 2 (BBJ2)",
        "model": "Boeing BBJ2",
        "category": "heavy",
        "passenger_capacity": 25,
        "range_km": 10000,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("22000"),
        "description": "Based on the Next-Generation 737-800, the BBJ2 delivers airliner space in a private configuration. Fully customisable with bedrooms, offices, conference rooms, and a walk-in shower.",
        "amenities": ["Fully custom interior", "Master bedroom", "Walk-in shower", "Conference room", "Office", "Galley", "Lounge"],
        "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    },

    # ── Ultra Long Range ───────────────────────────────────────────────────────
    {
        "name": "Gulfstream G700",
        "model": "G700",
        "category": "ultra_long",
        "passenger_capacity": 19,
        "range_km": 13890,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("21000"),
        "description": "Gulfstream's flagship ultra-long-range jet sets the new industry standard. The G700 features the largest cabin in its class with five living areas, full-stand-up headroom, and the most windows of any purpose-built bizjet.",
        "amenities": ["5 living areas", "Master stateroom with shower", "Ultra-Galley", "Lowest cabin altitude (4,850 ft)", "WiFi", "Circadian lighting", "16 panoramic windows per side"],
        "image_url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80",
    },
    {
        "name": "Bombardier Global 7500",
        "model": "Global 7500",
        "category": "ultra_long",
        "passenger_capacity": 19,
        "range_km": 14260,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("22000"),
        "description": "The world's longest-range and largest purpose-built private jet. The Global 7500 holds the record for the longest nonstop bizjet flight ever completed and offers four true living spaces including a full master suite.",
        "amenities": ["4 living spaces", "Full master suite", "Dedicated crew suite", "Full kitchen (not galley)", "Nuage seating", "WiFi", "Smooth Flex Wing"],
        "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
    },
    {
        "name": "Dassault Falcon 10X",
        "model": "Falcon 10X",
        "category": "ultra_long",
        "passenger_capacity": 19,
        "range_km": 15650,
        "cruise_speed_kmh": 956,
        "hourly_rate_usd": Decimal("23000"),
        "description": "Dassault's all-new ultra-widebody flagship redefines what's possible. The 10X offers the widest cabin in business aviation (with an airliner-class fuselage), connecting any two cities on Earth.",
        "amenities": ["Widest cabin in business aviation", "4 cabin zones", "Master suite with shower", "Full galley", "WiFi", "Satellite phone", "Advanced EASy III avionics"],
        "image_url": "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=800&q=80",
    },

    # ── VIP Airliners ──────────────────────────────────────────────────────────
    {
        "name": "Airbus ACJ320neo",
        "model": "ACJ320neo",
        "category": "vip_airliner",
        "passenger_capacity": 50,
        "range_km": 11100,
        "cruise_speed_kmh": 900,
        "hourly_rate_usd": Decimal("38000"),
        "description": "Airbus's corporate jet derivative of the A320neo family. An ACJ320neo configured for VIP use is a flying mansion — with floor plans that include bedrooms, bathrooms, conference rooms, a lounge, and a crew area.",
        "amenities": ["Fully bespoke interior", "Multiple bedrooms", "Conference room", "Lounge", "Full kitchen", "Crew quarters", "Satellite comms", "WiFi"],
        "image_url": "https://images.unsplash.com/photo-1513449328-09091f03d6f0?w=800&q=80",
    },
    {
        "name": "Boeing ACJ 747-8",
        "model": "ACJ 747-8 VIP",
        "category": "vip_airliner",
        "passenger_capacity": 120,
        "range_km": 16300,
        "cruise_speed_kmh": 988,
        "hourly_rate_usd": Decimal("75000"),
        "description": "The ultimate expression of airborne luxury. A VIP-configured 747-8 offers 4,786 sq ft of cabin space over two decks — enabling multiple master suites, a cinema, conference center, gym, and more.",
        "amenities": ["4,786 sq ft cabin", "Multiple master suites", "Cinema", "Conference center", "Gym", "Full kitchen", "Crew quarters for 20", "Unlimited range"],
        "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# YACHTS  (real vessels / class references)
# ──────────────────────────────────────────────────────────────────────────────
YACHTS = [
    # ── Small (< 30m) ──────────────────────────────────────────────────────────
    {
        "name": "Azure Lady",
        "size_category": "small",
        "length_meters": Decimal("22.5"),
        "guest_capacity": 6,
        "crew_count": 3,
        "home_port": "Ibiza, Spain",
        "daily_rate_usd": Decimal("12000"),
        "description": "An elegant Azimut 72 with a sleek Italian design profile. Azure Lady features a full-beam master cabin, two guest staterooms, and a generous sundeck perfect for Balearic island-hopping.",
        "amenities": ["Jet ski", "Paddleboards", "Snorkeling gear", "Sunpad", "Outdoor dining", "Air conditioning", "Generator"],
        "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    },
    {
        "name": "Bella Vita",
        "size_category": "small",
        "length_meters": Decimal("27.0"),
        "guest_capacity": 8,
        "crew_count": 4,
        "home_port": "Mykonos, Greece",
        "daily_rate_usd": Decimal("16500"),
        "description": "A Sunseeker 88 Yacht combining sporty performance with elegant design. Bella Vita's open-plan main salon, wraparound seating, and three luxurious staterooms make her ideal for Aegean adventures.",
        "amenities": ["Tender with outboard", "Water skis", "Snorkeling equipment", "BBQ", "Sunpads", "Satellite TV", "WiFi"],
        "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
    },
    {
        "name": "Dolce Mare",
        "size_category": "small",
        "length_meters": Decimal("28.5"),
        "guest_capacity": 8,
        "crew_count": 4,
        "home_port": "Portofino, Italy",
        "daily_rate_usd": Decimal("18000"),
        "description": "A Ferretti 920 with a flowing Italian interior by Studio Zuccon. Dolce Mare offers three cabins, a spacious salon, and exceptional stability for the Ligurian and Tyrrhenian coasts.",
        "amenities": ["Seabob", "Paddleboards", "Fishing equipment", "Espresso machine", "Outdoor dining for 8", "WiFi", "Air conditioning"],
        "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    },

    # ── Medium (30–50m) ────────────────────────────────────────────────────────
    {
        "name": "Serenity Now",
        "size_category": "medium",
        "length_meters": Decimal("38.0"),
        "guest_capacity": 10,
        "crew_count": 7,
        "home_port": "Monaco",
        "daily_rate_usd": Decimal("42000"),
        "description": "A Benetti 37m with a warm Tuscan interior featuring oak and marble throughout. Serenity Now accommodates 10 guests in five lavish staterooms with a master full-beam suite on the main deck.",
        "amenities": ["15-ft tender", "Two jet skis", "Seabobs", "Paddleboards", "Kayaks", "Diving equipment", "Gym", "WiFi", "Satellite TV", "Climate control"],
        "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
    },
    {
        "name": "Altitude",
        "size_category": "medium",
        "length_meters": Decimal("43.5"),
        "guest_capacity": 10,
        "crew_count": 8,
        "home_port": "Palma de Mallorca, Spain",
        "daily_rate_usd": Decimal("55000"),
        "description": "A striking Sunseeker 44m with a modern Scandinavian-inspired interior. Altitude's voluminous upper saloon, fold-down beach club, and 5 staterooms make her one of the most requested yachts in the Western Med.",
        "amenities": ["Beach club with swim platform", "Tender garage", "Two jet skis", "Seabob", "Flyboard", "Onboard gym", "Jacuzzi", "WiFi", "Stabilizers"],
        "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
    },
    {
        "name": "Northern Star",
        "size_category": "medium",
        "length_meters": Decimal("47.0"),
        "guest_capacity": 12,
        "crew_count": 9,
        "home_port": "Dubrovnik, Croatia",
        "daily_rate_usd": Decimal("68000"),
        "description": "A classic Feadship 47m blending the Dutch builder's legendary construction quality with a warm, contemporary interior. Northern Star's steel hull provides exceptional seakeeping for Adriatic islands.",
        "amenities": ["Stabilizers at anchor", "18-ft custom tender", "Diving setup", "Two jet skis", "Kayaks", "Sauna", "Jacuzzi", "WiFi", "Entertainment system"],
        "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    },

    # ── Large (50–80m) ─────────────────────────────────────────────────────────
    {
        "name": "Lady Sovereign",
        "size_category": "large",
        "length_meters": Decimal("58.0"),
        "guest_capacity": 12,
        "crew_count": 14,
        "home_port": "Antibes, France",
        "daily_rate_usd": Decimal("115000"),
        "description": "An iconic Lurssen 58m combining German engineering precision with a palatial interior by Reymond Langton. Lady Sovereign's volume belies her elegant profile — the main salon alone measures over 80 sq metres.",
        "amenities": ["Full beach club", "Jacuzzi on deck", "Gymnasium", "Tender garage with 26-ft tender", "Three jet skis", "Seabobs", "Zero-speed stabilisers", "WiFi", "Satellite comms", "Wine cellar"],
        "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
    },
    {
        "name": "Aqua Blu",
        "size_category": "large",
        "length_meters": Decimal("62.0"),
        "guest_capacity": 16,
        "crew_count": 15,
        "home_port": "Fort Lauderdale, USA",
        "daily_rate_usd": Decimal("135000"),
        "description": "A purpose-built expedition superyacht by Damen with ice-class capabilities. Aqua Blu carries a fleet of water toys and a submersible, making her ideal for remote destinations from the Maldives to Antarctica.",
        "amenities": ["Submarine", "Three dive compressors", "Full dive gear", "Multiple tenders", "Helicopter pad (H2)", "Jacuzzi", "Gym", "Sauna", "WiFi", "Stabilisers"],
        "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
    },
    {
        "name": "Titan",
        "size_category": "large",
        "length_meters": Decimal("73.0"),
        "guest_capacity": 12,
        "crew_count": 20,
        "home_port": "Dubai, UAE",
        "daily_rate_usd": Decimal("165000"),
        "description": "A Feadship 73m masterpiece characterised by her low-profile exterior and extraordinary interior volume. Titan's guest-to-crew ratio of 1:1.7 ensures impeccable service for up to 12 guests across 5 suites.",
        "amenities": ["Beach club with infinity pool", "Submersible", "Four tenders", "Multiple jet skis", "Helideck", "Gymnasium", "Cinema room", "Wine cellar", "Spa with sauna", "Zero-speed stabilisers"],
        "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    },

    # ── Superyachts (80m+) ─────────────────────────────────────────────────────
    {
        "name": "Jubilee",
        "size_category": "superyacht",
        "length_meters": Decimal("110.0"),
        "guest_capacity": 28,
        "crew_count": 35,
        "home_port": "Monaco",
        "daily_rate_usd": Decimal("450000"),
        "description": "A Oceanco 110m superyacht inspired by ancient Greek architecture, featuring six decks of meticulously crafted spaces. Jubilee's interior by Lobanov Studio blends classical antiquity with contemporary luxury across an astounding 2,600 GRT.",
        "amenities": ["Swimming pool", "Two Jacuzzis", "Cinema", "Beach club", "Helipad", "Gymnasium with spa", "Submersible", "Dive centre", "Multiple tenders", "Zero-speed stabilisers", "WiFi & satellite comms", "Wine cellar", "Owner's and VIP decks"],
        "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
    },
    {
        "name": "Blue Ice",
        "size_category": "superyacht",
        "length_meters": Decimal("85.0"),
        "guest_capacity": 12,
        "crew_count": 25,
        "home_port": "Bergen, Norway",
        "daily_rate_usd": Decimal("280000"),
        "description": "An ice-class Lurssen 85m expedition superyacht capable of navigating the Northwest Passage, Greenland, and Antarctica. Blue Ice marries rugged capability with world-class luxury across 5 decks.",
        "amenities": ["Ice-class hull", "Helipad with hangar", "Submersible", "RHIB tenders", "Complete dive centre", "Research lab", "Spa and sauna", "Cinema", "Zero-speed stabilisers", "Satellite internet"],
        "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
    },
    {
        "name": "Ocean Emerald",
        "size_category": "superyacht",
        "length_meters": Decimal("92.0"),
        "guest_capacity": 18,
        "crew_count": 28,
        "home_port": "Antibes, France",
        "daily_rate_usd": Decimal("320000"),
        "description": "A Feadship 92m distinguished by her striking steel-blue hull and interiors by Alberto Pinto. Ocean Emerald's nine guest suites, sky lounge, and spectacular beach club have made her a fixture of the Med season.",
        "amenities": ["Sky lounge", "Main pool with bar", "Beach club spa", "Cinema", "Fully equipped gym", "Three tenders", "Two jet skis", "Seabobs", "Full dive centre", "Helipad", "Stabilisers", "Satellite comms"],
        "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    },
    {
        "name": "Lady Christine",
        "size_category": "superyacht",
        "length_meters": Decimal("130.0"),
        "guest_capacity": 26,
        "crew_count": 42,
        "home_port": "Nassau, Bahamas",
        "daily_rate_usd": Decimal("620000"),
        "description": "One of the world's most celebrated charter superyachts — a 130m Lürssen with seven decks and interiors by RWD. Lady Christine has circumnavigated the globe multiple times and can accommodate 26 guests across 13 suites.",
        "amenities": ["Infinity pool", "Beach club", "Spa and beauty salon", "Cinema for 20", "Two helipads", "Submarine", "Dive centre", "Multiple tenders + jet skis", "Fully equipped gym", "Owner's deck with private pool", "Zero-speed stabilisers"],
        "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
    },
]


class Command(BaseCommand):
    help = "Seed VistaJets database with real airports, aircraft, and yachts"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing airports, aircraft, and yachts before seeding",
        )
        parser.add_argument(
            "--only",
            type=str,
            choices=["airports", "aircraft", "yachts"],
            help="Seed only one data type",
        )

    def handle(self, *args, **options):
        clear = options["clear"]
        only = options.get("only")

        self.stdout.write(self.style.HTTP_INFO("\n✈  VistaJets Seed Data\n" + "─" * 40))

        with transaction.atomic():
            if clear:
                self._clear(only)

            if not only or only == "airports":
                self._seed_airports()

            if not only or only == "aircraft":
                self._seed_aircraft()

            if not only or only == "yachts":
                self._seed_yachts()

        self.stdout.write(self.style.SUCCESS("\n✅  Seeding complete!\n"))

    # ──────────────────────────────────────────────────────────────────────────

    def _clear(self, only):
        if not only or only == "airports":
            count, _ = Airport.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"  Cleared {count} airports"))
        if not only or only == "aircraft":
            count, _ = Aircraft.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"  Cleared {count} aircraft"))
        if not only or only == "yachts":
            count, _ = Yacht.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"  Cleared {count} yachts"))

    def _seed_airports(self):
        created = updated = 0
        for data in AIRPORTS:
            obj, is_new = Airport.objects.update_or_create(
                code=data["code"],
                defaults=data,
            )
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f"  Airports  → {created} created, {updated} updated  (total: {len(AIRPORTS)})")
        )

    def _seed_aircraft(self):
        created = updated = 0
        for data in AIRCRAFT:
            obj, is_new = Aircraft.objects.update_or_create(
                name=data["name"],
                defaults={**data, "is_available": True},
            )
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f"  Aircraft  → {created} created, {updated} updated  (total: {len(AIRCRAFT)})")
        )

    def _seed_yachts(self):
        created = updated = 0
        for data in YACHTS:
            obj, is_new = Yacht.objects.update_or_create(
                name=data["name"],
                defaults={**data, "is_available": True},
            )
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f"  Yachts    → {created} created, {updated} updated  (total: {len(YACHTS)})")
        )