# flights/management/commands/seed_data.py
import uuid
from datetime import datetime, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from flights.models import (
    Airport, Aircraft, Yacht, FlightBooking, YachtCharter, 
    LeaseInquiry, ContactInquiry, GroupCharterInquiry, 
    AirCargoInquiry, AircraftSalesInquiry, FlightLeg
)


class Command(BaseCommand):
    help = 'Seed the database with initial data for Vista Jets'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()
        
        self.seed_data()
        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))

    def clear_data(self):
        """Clear existing data from all tables"""
        self.stdout.write('Clearing existing data...')
        
        # Delete in reverse order of dependencies
        FlightLeg.objects.all().delete()
        FlightBooking.objects.all().delete()
        YachtCharter.objects.all().delete()
        LeaseInquiry.objects.all().delete()
        ContactInquiry.objects.all().delete()
        GroupCharterInquiry.objects.all().delete()
        AirCargoInquiry.objects.all().delete()
        AircraftSalesInquiry.objects.all().delete()
        Aircraft.objects.all().delete()
        Yacht.objects.all().delete()
        Airport.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Existing data cleared'))

    @transaction.atomic
    def seed_data(self):
        """Seed all data"""
        self.stdout.write('Starting data seeding...')
        
        # Seed in order of dependencies
        self.seed_airports()
        self.seed_aircraft()
        self.seed_yachts()
        self.seed_flight_bookings()
        self.seed_yacht_charters()
        self.seed_lease_inquiries()
        self.seed_contact_inquiries()
        self.seed_group_charter_inquiries()
        self.seed_air_cargo_inquiries()
        self.seed_aircraft_sales_inquiries()
        
        self.stdout.write(self.style.SUCCESS('All data seeded successfully'))

    def seed_airports(self):
        """Seed airport data"""
        self.stdout.write('Seeding airports...')
        
        airports_data = [
            {
                "pk": 1,
                "code": "JFK",
                "name": "John F. Kennedy International Airport",
                "city": "New York",
                "country": "USA",
                "latitude": "40.641300",
                "longitude": "-73.778100"
            },
            {
                "pk": 2,
                "code": "TEB",
                "name": "Teterboro Airport",
                "city": "Teterboro",
                "country": "USA",
                "latitude": "40.850100",
                "longitude": "-74.060800"
            },
            {
                "pk": 3,
                "code": "VNY",
                "name": "Van Nuys Airport",
                "city": "Los Angeles",
                "country": "USA",
                "latitude": "34.209800",
                "longitude": "-118.489800"
            },
            {
                "pk": 4,
                "code": "LAX",
                "name": "Los Angeles International Airport",
                "city": "Los Angeles",
                "country": "USA",
                "latitude": "33.942500",
                "longitude": "-118.408100"
            },
            {
                "pk": 5,
                "code": "MIA",
                "name": "Miami International Airport",
                "city": "Miami",
                "country": "USA",
                "latitude": "25.795900",
                "longitude": "-80.287000"
            },
            {
                "pk": 6,
                "code": "OPF",
                "name": "Miami-Opa Locka Executive Airport",
                "city": "Miami",
                "country": "USA",
                "latitude": "25.907000",
                "longitude": "-80.278400"
            },
            {
                "pk": 7,
                "code": "ORD",
                "name": "O'Hare International Airport",
                "city": "Chicago",
                "country": "USA",
                "latitude": "41.974200",
                "longitude": "-87.907300"
            },
            {
                "pk": 8,
                "code": "MDW",
                "name": "Chicago Midway International Airport",
                "city": "Chicago",
                "country": "USA",
                "latitude": "41.786800",
                "longitude": "-87.752200"
            },
            {
                "pk": 9,
                "code": "DFW",
                "name": "Dallas/Fort Worth International Airport",
                "city": "Dallas",
                "country": "USA",
                "latitude": "32.899800",
                "longitude": "-97.040300"
            },
            {
                "pk": 10,
                "code": "HOU",
                "name": "William P. Hobby Airport",
                "city": "Houston",
                "country": "USA",
                "latitude": "29.645400",
                "longitude": "-95.278900"
            },
            {
                "pk": 11,
                "code": "SFO",
                "name": "San Francisco International Airport",
                "city": "San Francisco",
                "country": "USA",
                "latitude": "37.621300",
                "longitude": "-122.379000"
            },
            {
                "pk": 12,
                "code": "SQL",
                "name": "San Carlos Airport",
                "city": "San Carlos",
                "country": "USA",
                "latitude": "37.511900",
                "longitude": "-122.249700"
            },
            {
                "pk": 13,
                "code": "BOS",
                "name": "Boston Logan International Airport",
                "city": "Boston",
                "country": "USA",
                "latitude": "42.365600",
                "longitude": "-71.009600"
            },
            {
                "pk": 14,
                "code": "BED",
                "name": "Hanscom Field",
                "city": "Bedford",
                "country": "USA",
                "latitude": "42.470000",
                "longitude": "-71.289000"
            },
            {
                "pk": 15,
                "code": "IAD",
                "name": "Washington Dulles International Airport",
                "city": "Washington D.C.",
                "country": "USA",
                "latitude": "38.953100",
                "longitude": "-77.456500"
            },
            {
                "pk": 16,
                "code": "LAS",
                "name": "Harry Reid International Airport",
                "city": "Las Vegas",
                "country": "USA",
                "latitude": "36.084000",
                "longitude": "-115.153700"
            },
            {
                "pk": 17,
                "code": "HND",
                "name": "Tokyo Haneda Airport",
                "city": "Tokyo",
                "country": "Japan",
                "latitude": "35.549300",
                "longitude": "139.779800"
            },
            {
                "pk": 18,
                "code": "SEA",
                "name": "Seattle-Tacoma International Airport",
                "city": "Seattle",
                "country": "USA",
                "latitude": "47.450200",
                "longitude": "-122.308800"
            },
            {
                "pk": 19,
                "code": "BFI",
                "name": "King County International Airport (Boeing)",
                "city": "Seattle",
                "country": "USA",
                "latitude": "47.530000",
                "longitude": "-122.301900"
            },
            {
                "pk": 20,
                "code": "ATL",
                "name": "Hartsfield-Jackson Atlanta International",
                "city": "Atlanta",
                "country": "USA",
                "latitude": "33.640700",
                "longitude": "-84.427700"
            },
            {
                "pk": 21,
                "code": "PDK",
                "name": "DeKalb-Peachtree Airport",
                "city": "Atlanta",
                "country": "USA",
                "latitude": "33.875600",
                "longitude": "-84.302000"
            },
            {
                "pk": 22,
                "code": "DEN",
                "name": "Denver International Airport",
                "city": "Denver",
                "country": "USA",
                "latitude": "39.856100",
                "longitude": "-104.673700"
            },
            {
                "pk": 23,
                "code": "APA",
                "name": "Centennial Airport",
                "city": "Denver",
                "country": "USA",
                "latitude": "39.570100",
                "longitude": "-104.849100"
            },
            {
                "pk": 24,
                "code": "MCO",
                "name": "Orlando International Airport",
                "city": "Orlando",
                "country": "USA",
                "latitude": "28.431200",
                "longitude": "-81.308100"
            },
            {
                "pk": 25,
                "code": "PBI",
                "name": "Palm Beach International Airport",
                "city": "Palm Beach",
                "country": "USA",
                "latitude": "26.683200",
                "longitude": "-80.095600"
            },
            {
                "pk": 26,
                "code": "EYW",
                "name": "Key West International Airport",
                "city": "Key West",
                "country": "USA",
                "latitude": "24.556100",
                "longitude": "-81.759600"
            },
            {
                "pk": 27,
                "code": "ASP",
                "name": "Aspen/Pitkin County Airport",
                "city": "Aspen",
                "country": "USA",
                "latitude": "39.223200",
                "longitude": "-106.868800"
            },
            {
                "pk": 28,
                "code": "SUN",
                "name": "Friedman Memorial Airport",
                "city": "Sun Valley",
                "country": "USA",
                "latitude": "43.504400",
                "longitude": "-114.296400"
            },
            {
                "pk": 29,
                "code": "HPN",
                "name": "Westchester County Airport",
                "city": "White Plains",
                "country": "USA",
                "latitude": "41.067000",
                "longitude": "-73.707600"
            },
            {
                "pk": 30,
                "code": "YYZ",
                "name": "Toronto Pearson International Airport",
                "city": "Toronto",
                "country": "Canada",
                "latitude": "43.677700",
                "longitude": "-79.624800"
            },
            {
                "pk": 31,
                "code": "YUL",
                "name": "Montréal-Trudeau International Airport",
                "city": "Montreal",
                "country": "Canada",
                "latitude": "45.470600",
                "longitude": "-73.740800"
            },
            {
                "pk": 32,
                "code": "YVR",
                "name": "Vancouver International Airport",
                "city": "Vancouver",
                "country": "Canada",
                "latitude": "49.194700",
                "longitude": "-123.179200"
            },
            {
                "pk": 33,
                "code": "MEX",
                "name": "Benito Juárez International Airport",
                "city": "Mexico City",
                "country": "Mexico",
                "latitude": "19.436300",
                "longitude": "-99.072100"
            },
            {
                "pk": 34,
                "code": "CUN",
                "name": "Cancún International Airport",
                "city": "Cancún",
                "country": "Mexico",
                "latitude": "21.036500",
                "longitude": "-86.877000"
            },
            {
                "pk": 35,
                "code": "LHR",
                "name": "London Heathrow Airport",
                "city": "London",
                "country": "UK",
                "latitude": "51.470000",
                "longitude": "-0.454300"
            },
            {
                "pk": 36,
                "code": "LCY",
                "name": "London City Airport",
                "city": "London",
                "country": "UK",
                "latitude": "51.505300",
                "longitude": "0.055300"
            },
            {
                "pk": 37,
                "code": "FAB",
                "name": "Farnborough Airport",
                "city": "Farnborough",
                "country": "UK",
                "latitude": "51.277600",
                "longitude": "-0.776200"
            },
            {
                "pk": 38,
                "code": "CDG",
                "name": "Paris Charles de Gaulle Airport",
                "city": "Paris",
                "country": "France",
                "latitude": "49.009700",
                "longitude": "2.547900"
            },
            {
                "pk": 39,
                "code": "LBG",
                "name": "Paris Le Bourget Airport",
                "city": "Paris",
                "country": "France",
                "latitude": "48.969400",
                "longitude": "2.441400"
            },
            {
                "pk": 40,
                "code": "NCE",
                "name": "Nice Côte d'Azur Airport",
                "city": "Nice",
                "country": "France",
                "latitude": "43.658400",
                "longitude": "7.215900"
            },
            {
                "pk": 41,
                "code": "BER",
                "name": "Berlin Brandenburg Airport",
                "city": "Berlin",
                "country": "Germany",
                "latitude": "52.366700",
                "longitude": "13.503300"
            },
            {
                "pk": 42,
                "code": "MUC",
                "name": "Munich Airport",
                "city": "Munich",
                "country": "Germany",
                "latitude": "48.353700",
                "longitude": "11.775000"
            },
            {
                "pk": 43,
                "code": "FRA",
                "name": "Frankfurt Airport",
                "city": "Frankfurt",
                "country": "Germany",
                "latitude": "50.037900",
                "longitude": "8.562200"
            },
            {
                "pk": 44,
                "code": "ZRH",
                "name": "Zurich Airport",
                "city": "Zurich",
                "country": "Switzerland",
                "latitude": "47.458200",
                "longitude": "8.555500"
            },
            {
                "pk": 45,
                "code": "GVA",
                "name": "Geneva Airport",
                "city": "Geneva",
                "country": "Switzerland",
                "latitude": "46.238100",
                "longitude": "6.108900"
            },
            {
                "pk": 46,
                "code": "AMS",
                "name": "Amsterdam Schiphol Airport",
                "city": "Amsterdam",
                "country": "Netherlands",
                "latitude": "52.310500",
                "longitude": "4.768300"
            },
            {
                "pk": 47,
                "code": "MAD",
                "name": "Adolfo Suárez Madrid-Barajas Airport",
                "city": "Madrid",
                "country": "Spain",
                "latitude": "40.493600",
                "longitude": "-3.566800"
            },
            {
                "pk": 48,
                "code": "BCN",
                "name": "Josep Tarradellas Barcelona-El Prat Airport",
                "city": "Barcelona",
                "country": "Spain",
                "latitude": "41.297100",
                "longitude": "2.078500"
            },
            {
                "pk": 49,
                "code": "IBZ",
                "name": "Ibiza Airport",
                "city": "Ibiza",
                "country": "Spain",
                "latitude": "38.872900",
                "longitude": "1.373100"
            },
            {
                "pk": 50,
                "code": "PMI",
                "name": "Palma de Mallorca Airport",
                "city": "Palma",
                "country": "Spain",
                "latitude": "39.551700",
                "longitude": "2.738800"
            },
            {
                "pk": 51,
                "code": "FCO",
                "name": "Rome Fiumicino Airport",
                "city": "Rome",
                "country": "Italy",
                "latitude": "41.800300",
                "longitude": "12.238900"
            },
            {
                "pk": 52,
                "code": "MXP",
                "name": "Milan Malpensa Airport",
                "city": "Milan",
                "country": "Italy",
                "latitude": "45.630600",
                "longitude": "8.728100"
            },
            {
                "pk": 53,
                "code": "VCE",
                "name": "Venice Marco Polo Airport",
                "city": "Venice",
                "country": "Italy",
                "latitude": "45.505300",
                "longitude": "12.351900"
            },
            {
                "pk": 54,
                "code": "OLB",
                "name": "Olbia Costa Smeralda Airport",
                "city": "Olbia",
                "country": "Italy",
                "latitude": "40.898700",
                "longitude": "9.517600"
            },
            {
                "pk": 55,
                "code": "ATH",
                "name": "Athens International Airport",
                "city": "Athens",
                "country": "Greece",
                "latitude": "37.936400",
                "longitude": "23.944500"
            },
            {
                "pk": 56,
                "code": "JTR",
                "name": "Santorini (Thira) Airport",
                "city": "Santorini",
                "country": "Greece",
                "latitude": "36.399200",
                "longitude": "25.479300"
            },
            {
                "pk": 57,
                "code": "JMK",
                "name": "Mykonos Island National Airport",
                "city": "Mykonos",
                "country": "Greece",
                "latitude": "37.435100",
                "longitude": "25.348100"
            },
            {
                "pk": 58,
                "code": "HER",
                "name": "Heraklion International Airport",
                "city": "Crete",
                "country": "Greece",
                "latitude": "35.339700",
                "longitude": "25.180300"
            },
            {
                "pk": 59,
                "code": "SVO",
                "name": "Sheremetyevo International Airport",
                "city": "Moscow",
                "country": "Russia",
                "latitude": "55.972600",
                "longitude": "37.414600"
            },
            {
                "pk": 60,
                "code": "VKO",
                "name": "Vnukovo International Airport",
                "city": "Moscow",
                "country": "Russia",
                "latitude": "55.591500",
                "longitude": "37.261500"
            },
            {
                "pk": 61,
                "code": "DXB",
                "name": "Dubai International Airport",
                "city": "Dubai",
                "country": "UAE",
                "latitude": "25.253200",
                "longitude": "55.365700"
            },
            {
                "pk": 62,
                "code": "DWC",
                "name": "Al Maktoum International Airport",
                "city": "Dubai",
                "country": "UAE",
                "latitude": "24.896300",
                "longitude": "55.161200"
            },
            {
                "pk": 63,
                "code": "AUH",
                "name": "Abu Dhabi International Airport",
                "city": "Abu Dhabi",
                "country": "UAE",
                "latitude": "24.433000",
                "longitude": "54.651100"
            },
            {
                "pk": 64,
                "code": "DOH",
                "name": "Hamad International Airport",
                "city": "Doha",
                "country": "Qatar",
                "latitude": "25.273100",
                "longitude": "51.608100"
            },
            {
                "pk": 65,
                "code": "RUH",
                "name": "King Khalid International Airport",
                "city": "Riyadh",
                "country": "Saudi Arabia",
                "latitude": "24.957800",
                "longitude": "46.698800"
            },
            {
                "pk": 66,
                "code": "JED",
                "name": "King Abdulaziz International Airport",
                "city": "Jeddah",
                "country": "Saudi Arabia",
                "latitude": "21.679600",
                "longitude": "39.156500"
            },
            {
                "pk": 67,
                "code": "TLV",
                "name": "Ben Gurion International Airport",
                "city": "Tel Aviv",
                "country": "Israel",
                "latitude": "32.011400",
                "longitude": "34.886700"
            },
            {
                "pk": 68,
                "code": "CAI",
                "name": "Cairo International Airport",
                "city": "Cairo",
                "country": "Egypt",
                "latitude": "30.121900",
                "longitude": "31.405600"
            },
            {
                "pk": 69,
                "code": "CPT",
                "name": "Cape Town International Airport",
                "city": "Cape Town",
                "country": "South Africa",
                "latitude": "-33.971500",
                "longitude": "18.602100"
            },
            {
                "pk": 70,
                "code": "JNB",
                "name": "O.R. Tambo International Airport",
                "city": "Johannesburg",
                "country": "South Africa",
                "latitude": "-26.139200",
                "longitude": "28.246000"
            },
            {
                "pk": 71,
                "code": "MBA",
                "name": "Moi International Airport",
                "city": "Mombasa",
                "country": "Kenya",
                "latitude": "-4.034800",
                "longitude": "39.594200"
            },
            {
                "pk": 72,
                "code": "HKG",
                "name": "Hong Kong International Airport",
                "city": "Hong Kong",
                "country": "Hong Kong",
                "latitude": "22.308000",
                "longitude": "113.918500"
            },
            {
                "pk": 73,
                "code": "SIN",
                "name": "Singapore Changi Airport",
                "city": "Singapore",
                "country": "Singapore",
                "latitude": "1.364400",
                "longitude": "103.991500"
            },
            {
                "pk": 74,
                "code": "NRT",
                "name": "Tokyo Narita International Airport",
                "city": "Tokyo",
                "country": "Japan",
                "latitude": "35.771900",
                "longitude": "140.392900"
            },
            {
                "pk": 75,
                "code": "SYD",
                "name": "Sydney Kingsford Smith Airport",
                "city": "Sydney",
                "country": "Australia",
                "latitude": "-33.939900",
                "longitude": "151.175300"
            },
            {
                "pk": 76,
                "code": "MEL",
                "name": "Melbourne Airport",
                "city": "Melbourne",
                "country": "Australia",
                "latitude": "-37.669000",
                "longitude": "144.841000"
            },
            {
                "pk": 77,
                "code": "BKK",
                "name": "Suvarnabhumi Airport",
                "city": "Bangkok",
                "country": "Thailand",
                "latitude": "13.681100",
                "longitude": "100.747500"
            },
            {
                "pk": 78,
                "code": "PQC",
                "name": "Phu Quoc International Airport",
                "city": "Phu Quoc",
                "country": "Vietnam",
                "latitude": "10.227000",
                "longitude": "103.967300"
            },
            {
                "pk": 79,
                "code": "MLE",
                "name": "Velana International Airport",
                "city": "Malé",
                "country": "Maldives",
                "latitude": "4.191800",
                "longitude": "73.529000"
            },
            {
                "pk": 80,
                "code": "BOM",
                "name": "Chhatrapati Shivaji Maharaj International",
                "city": "Mumbai",
                "country": "India",
                "latitude": "19.089600",
                "longitude": "72.865600"
            },
            {
                "pk": 81,
                "code": "DEL",
                "name": "Indira Gandhi International Airport",
                "city": "New Delhi",
                "country": "India",
                "latitude": "28.556200",
                "longitude": "77.100000"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for airport_data in airports_data:
            airport, created = Airport.objects.update_or_create(
                pk=airport_data['pk'],
                defaults={
                    'code': airport_data['code'],
                    'name': airport_data['name'],
                    'city': airport_data['city'],
                    'country': airport_data['country'],
                    'latitude': airport_data['latitude'],
                    'longitude': airport_data['longitude'],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Airports: {created_count} created, {updated_count} updated')

    def seed_aircraft(self):
        """Seed aircraft data"""
        self.stdout.write('Seeding aircraft...')
        
        aircraft_data = [
            {
                "pk": 1,
                "name": "Cessna Citation CJ4",
                "model": "Citation CJ4",
                "category": "light",
                "passenger_capacity": 8,
                "range_km": 3204,
                "cruise_speed_kmh": 778,
                "description": "The pinnacle of the CJ family, offering a transcontinental light jet experience. Features a flat-floor cabin with stand-up headroom and exceptional fuel efficiency for trips up to 1,700 nm.",
                "amenities": ["WiFi", "Leather seating", "Refreshment center", "Enclosed lavatory", "Baggage access in-flight"],
                "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
                "hourly_rate_usd": "4200.00",
                "is_available": True
            },
            {
                "pk": 2,
                "name": "Embraer Phenom 300E",
                "model": "Phenom 300E",
                "category": "light",
                "passenger_capacity": 7,
                "range_km": 3650,
                "cruise_speed_kmh": 834,
                "description": "World's best-selling light jet for over a decade. The 300E combines stunning interior design with performance that rivals midsize jets, including the fastest speed in its class.",
                "amenities": ["HD entertainment", "WiFi", "Dual-zone temperature control", "Enclosed lavatory", "Full leather interior"],
                "image_url": "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
                "hourly_rate_usd": "4800.00",
                "is_available": True
            },
            {
                "pk": 3,
                "name": "HondaJet Elite II",
                "model": "HondaJet Elite II",
                "category": "light",
                "passenger_capacity": 6,
                "range_km": 2661,
                "cruise_speed_kmh": 782,
                "description": "Honda's revolutionary over-the-wing engine mount design delivers the quietest, most fuel-efficient cabin in the light jet segment, with a surprisingly spacious interior.",
                "amenities": ["Quietest cabin in class", "Refreshment center", "Lavatory", "Leather seating", "WiFi"],
                "image_url": "https://www.ainonline.com/cdn-cgi/image/width=3840,format=webp,quality=95/https://backend.ainonline.com/sites/default/files/styles/fpsc_1200x630/public/uploads/2023/05/5dwm2033web.jpg?h=95ffb99b&itok=",
                "hourly_rate_usd": "3800.00",
                "is_available": True
            },
            {
                "pk": 4,
                "name": "Pilatus PC-24",
                "model": "PC-24 Super Versatile Jet",
                "category": "light",
                "passenger_capacity": 10,
                "range_km": 3580,
                "cruise_speed_kmh": 815,
                "description": "The world's first Super Versatile Jet. Can operate from unpaved, short, or high-altitude runways — opening up destinations no other jet can reach — while maintaining a premium cabin.",
                "amenities": ["Short runway capability", "WiFi", "Large cargo door", "Club seating", "Refreshment center"],
                "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
                "hourly_rate_usd": "5100.00",
                "is_available": True
            },
            {
                "pk": 5,
                "name": "Hawker 900XP",
                "model": "Hawker 900XP",
                "category": "midsize",
                "passenger_capacity": 9,
                "range_km": 5190,
                "cruise_speed_kmh": 841,
                "description": "A British classic with the longest range in the midsize category. The 900XP's stand-up cabin, true galley, and separate lavatory make transatlantic positioning viable for a midsize aircraft.",
                "amenities": ["Stand-up cabin", "Full galley", "DVD entertainment", "Enclosed lavatory", "Separate crew area"],
                "image_url": "https://execaireaviation.com/wp-content/uploads/2024/06/Hawker-900XP-Exterior-Front-1-copy-3-scaled.jpg",
                "hourly_rate_usd": "6500.00",
                "is_available": True
            },
            {
                "pk": 6,
                "name": "Cessna Citation Latitude",
                "model": "Citation Latitude",
                "category": "midsize",
                "passenger_capacity": 9,
                "range_km": 4630,
                "cruise_speed_kmh": 851,
                "description": "Designed from the ground up with passenger comfort as the priority. Features the widest and tallest cabin in its class, a true flat floor, and a fully enclosed aft lavatory with vanity.",
                "amenities": ["Widest cabin in class", "Flat floor", "WiFi", "Full galley", "Enclosed lavatory with vanity"],
                "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
                "hourly_rate_usd": "7000.00",
                "is_available": True
            },
            {
                "pk": 7,
                "name": "Embraer Legacy 450",
                "model": "Legacy 450",
                "category": "midsize",
                "passenger_capacity": 8,
                "range_km": 4630,
                "cruise_speed_kmh": 870,
                "description": "Fly-by-wire technology in a midsize jet brings unmatched handling precision. The Legacy 450 offers stand-up headroom throughout, a full flat-bed configuration, and a revolutionary full cabin.",
                "amenities": ["Fly-by-wire", "Full flat-bed seating", "Stand-up cabin", "WiFi", "Enclosed lavatory"],
                "image_url": "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80",
                "hourly_rate_usd": "7200.00",
                "is_available": True
            },
            {
                "pk": 8,
                "name": "Bombardier Challenger 350",
                "model": "Challenger 350",
                "category": "super_midsize",
                "passenger_capacity": 10,
                "range_km": 5926,
                "cruise_speed_kmh": 870,
                "description": "The market-defining super midsize jet. The Challenger 350 combines coast-to-coast nonstop capability with a remarkably wide cabin, best-in-class baggage, and industry-leading reliability.",
                "amenities": ["WiFi", "Entertainment system", "Full galley", "Stand-up cabin", "Enclosed lavatory", "Club and lounge seating"],
                "image_url": "https://images.aircharterservice.com/global/aircraft-guide/private-charter/bombardier-challenger-350.jpg",
                "hourly_rate_usd": "9800.00",
                "is_available": True
            },
            {
                "pk": 9,
                "name": "Gulfstream G280",
                "model": "G280",
                "category": "super_midsize",
                "passenger_capacity": 10,
                "range_km": 6667,
                "cruise_speed_kmh": 900,
                "description": "Gulfstream's entry into the super midsize market combines the brand's legendary aviation DNA with a cabin that sets the benchmark. The longest range in its class enables unprecedented nonstop routes.",
                "amenities": ["Gulfstream cabin air quality", "WiFi", "Advanced avionics", "Full galley", "Enclosed lavatory"],
                "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
                "hourly_rate_usd": "10500.00",
                "is_available": True
            },
            {
                "pk": 10,
                "name": "Dassault Falcon 2000LXS",
                "model": "Falcon 2000LXS",
                "category": "super_midsize",
                "passenger_capacity": 10,
                "range_km": 7408,
                "cruise_speed_kmh": 870,
                "description": "The Falcon 2000LXS is the only aircraft in its class capable of accessing demanding short-field airports like London City while delivering intercontinental range — a truly unique capability.",
                "amenities": ["Short-field capability", "EasyLink WiFi", "Falcon Eye HUD", "Full galley", "Lounge configuration", "DVD/entertainment"],
                "image_url": "https://www.thejetbusiness.com/images/jets/399/399_exterior_1.jpg",
                "hourly_rate_usd": "11000.00",
                "is_available": True
            },
            {
                "pk": 11,
                "name": "Gulfstream G550",
                "model": "G550",
                "category": "heavy",
                "passenger_capacity": 16,
                "range_km": 12501,
                "cruise_speed_kmh": 956,
                "description": "One of the most trusted heavy jets ever built, the G550 has transported heads of state and business leaders around the globe for two decades. With 6,750 nm of range, it connects almost any city pair nonstop.",
                "amenities": ["PlaneView cockpit", "WiFi", "Full galley & crew rest", "Master stateroom", "Shower", "3-zone cabin", "Entertainment system"],
                "image_url": "https://www.airpartner.com/media/amndvnfl/gulfstream-g550-exterior-1140x980.jpg",
                "hourly_rate_usd": "13500.00",
                "is_available": True
            },
            {
                "pk": 12,
                "name": "Bombardier Global 5500",
                "model": "Global 5500",
                "category": "heavy",
                "passenger_capacity": 16,
                "range_km": 9630,
                "cruise_speed_kmh": 956,
                "description": "Redesigned from the ground up with Bombardier's Nuage seating — the most ergonomic seat in aviation history. The Global 5500 redefines cabin comfort at 51,000 ft.",
                "amenities": ["Nuage seating", "Circadian lighting", "Low cabin altitude (5,800 ft)", "WiFi", "Full galley", "Master suite", "3 living areas"],
                "image_url": "https://i.insider.com/5f11e02d988ee3556b050aa3?width=1200&format=jpeg",
                "hourly_rate_usd": "14000.00",
                "is_available": True
            },
            {
                "pk": 13,
                "name": "Dassault Falcon 8X",
                "model": "Falcon 8X",
                "category": "heavy",
                "passenger_capacity": 16,
                "range_km": 11945,
                "cruise_speed_kmh": 956,
                "description": "Three engines. 11,450 km of range. The Falcon 8X connects Dubai to New York, London to Singapore, and virtually any global city pair while delivering the quiet refinement Dassault is celebrated for.",
                "amenities": ["Trijet reliability", "30+ window configuration", "FalconCabin WiFi", "Master stateroom", "Full galley", "Lounge areas"],
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMGUWTxZRnrm7UGFfTuTRmPR8OQ-SeC_yNPQ&s",
                "hourly_rate_usd": "15000.00",
                "is_available": True
            },
            {
                "pk": 14,
                "name": "Boeing Business Jet 2 (BBJ2)",
                "model": "Boeing BBJ2",
                "category": "heavy",
                "passenger_capacity": 25,
                "range_km": 10000,
                "cruise_speed_kmh": 956,
                "description": "Based on the Next-Generation 737-800, the BBJ2 delivers airliner space in a private configuration. Fully customisable with bedrooms, offices, conference rooms, and a walk-in shower.",
                "amenities": ["Fully custom interior", "Master bedroom", "Walk-in shower", "Conference room", "Office", "Galley", "Lounge"],
                "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
                "hourly_rate_usd": "22000.00",
                "is_available": True
            },
            {
                "pk": 15,
                "name": "Gulfstream G700",
                "model": "G700",
                "category": "ultra_long",
                "passenger_capacity": 19,
                "range_km": 13890,
                "cruise_speed_kmh": 956,
                "description": "Gulfstream's flagship ultra-long-range jet sets the new industry standard. The G700 features the largest cabin in its class with five living areas, full-stand-up headroom, and the most windows of any purpose-built bizjet.",
                "amenities": ["5 living areas", "Master stateroom with shower", "Ultra-Galley", "Lowest cabin altitude (4,850 ft)", "WiFi", "Circadian lighting", "16 panoramic windows per side"],
                "image_url": "https://media.bizj.us/view/img/13056902/svbj-flexjet-010*900xx6048-3411-0-0.jpg",
                "hourly_rate_usd": "21000.00",
                "is_available": True
            },
            {
                "pk": 16,
                "name": "Bombardier Global 7500",
                "model": "Global 7500",
                "category": "ultra_long",
                "passenger_capacity": 19,
                "range_km": 14260,
                "cruise_speed_kmh": 956,
                "description": "The world's longest-range and largest purpose-built private jet. The Global 7500 holds the record for the longest nonstop bizjet flight ever completed and offers four true living spaces including a full master suite.",
                "amenities": ["4 living spaces", "Full master suite", "Dedicated crew suite", "Full kitchen (not galley)", "Nuage seating", "WiFi", "Smooth Flex Wing"],
                "image_url": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
                "hourly_rate_usd": "22000.00",
                "is_available": True
            },
            {
                "pk": 17,
                "name": "Dassault Falcon 10X",
                "model": "Falcon 10X",
                "category": "ultra_long",
                "passenger_capacity": 19,
                "range_km": 15650,
                "cruise_speed_kmh": 956,
                "description": "Dassault's all-new ultra-widebody flagship redefines what's possible. The 10X offers the widest cabin in business aviation (with an airliner-class fuselage), connecting any two cities on Earth.",
                "amenities": ["Widest cabin in business aviation", "4 cabin zones", "Master suite with shower", "Full galley", "WiFi", "Satellite phone", "Advanced EASy III avionics"],
                "image_url": "https://www.dc-aviation.com/fileadmin/user_upload/headerbild-falcon-2000lxs.jpeg",
                "hourly_rate_usd": "23000.00",
                "is_available": True
            },
            {
                "pk": 18,
                "name": "Airbus ACJ320neo",
                "model": "ACJ320neo",
                "category": "vip_airliner",
                "passenger_capacity": 50,
                "range_km": 11100,
                "cruise_speed_kmh": 900,
                "description": "Airbus's corporate jet derivative of the A320neo family. An ACJ320neo configured for VIP use is a flying mansion — with floor plans that include bedrooms, bathrooms, conference rooms, a lounge, and a crew area.",
                "amenities": ["Fully bespoke interior", "Multiple bedrooms", "Conference room", "Lounge", "Full kitchen", "Crew quarters", "Satellite comms", "WiFi"],
                "image_url": "https://www.acj.airbus.com/sites/g/files/jlcbta131/files/2021-11/1st-ACJ320neo.jpg",
                "hourly_rate_usd": "38000.00",
                "is_available": True
            },
            {
                "pk": 19,
                "name": "Boeing ACJ 747-8",
                "model": "ACJ 747-8 VIP",
                "category": "vip_airliner",
                "passenger_capacity": 120,
                "range_km": 16300,
                "cruise_speed_kmh": 988,
                "description": "The ultimate expression of airborne luxury. A VIP-configured 747-8 offers 4,786 sq ft of cabin space over two decks — enabling multiple master suites, a cinema, conference center, gym, and more.",
                "amenities": ["4,786 sq ft cabin", "Multiple master suites", "Cinema", "Conference center", "Gym", "Full kitchen", "Crew quarters for 20", "Unlimited range"],
                "image_url": "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
                "hourly_rate_usd": "75000.00",
                "is_available": True
            }
        ]

        created_count = 0
        updated_count = 0
        
        for ac_data in aircraft_data:
            aircraft, created = Aircraft.objects.update_or_create(
                pk=ac_data['pk'],
                defaults={
                    'name': ac_data['name'],
                    'model': ac_data['model'],
                    'category': ac_data['category'],
                    'passenger_capacity': ac_data['passenger_capacity'],
                    'range_km': ac_data['range_km'],
                    'cruise_speed_kmh': ac_data['cruise_speed_kmh'],
                    'description': ac_data['description'],
                    'amenities': ac_data['amenities'],
                    'image_url': ac_data['image_url'],
                    'hourly_rate_usd': ac_data['hourly_rate_usd'],
                    'is_available': ac_data['is_available'],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Aircraft: {created_count} created, {updated_count} updated')

    def seed_yachts(self):
        """Seed yacht data"""
        self.stdout.write('Seeding yachts...')
        
        yachts_data = [
            {
                "pk": 1,
                "name": "Azure Lady",
                "size_category": "small",
                "length_meters": "22.50",
                "guest_capacity": 6,
                "crew_count": 3,
                "description": "An elegant Azimut 72 with a sleek Italian design profile. Azure Lady features a full-beam master cabin, two guest staterooms, and a generous sundeck perfect for Balearic island-hopping.",
                "amenities": ["Jet ski", "Paddleboards", "Snorkeling gear", "Sunpad", "Outdoor dining", "Air conditioning", "Generator"],
                "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
                "daily_rate_usd": "12000.00",
                "home_port": "Ibiza, Spain",
                "is_available": True
            },
            {
                "pk": 2,
                "name": "Bella Vita",
                "size_category": "small",
                "length_meters": "27.00",
                "guest_capacity": 8,
                "crew_count": 4,
                "description": "A Sunseeker 88 Yacht combining sporty performance with elegant design. Bella Vita's open-plan main salon, wraparound seating, and three luxurious staterooms make her ideal for Aegean adventures.",
                "amenities": ["Tender with outboard", "Water skis", "Snorkeling equipment", "BBQ", "Sunpads", "Satellite TV", "WiFi"],
                "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
                "daily_rate_usd": "16500.00",
                "home_port": "Mykonos, Greece",
                "is_available": True
            },
            {
                "pk": 3,
                "name": "Dolce Mare",
                "size_category": "small",
                "length_meters": "28.50",
                "guest_capacity": 8,
                "crew_count": 4,
                "description": "A Ferretti 920 with a flowing Italian interior by Studio Zuccon. Dolce Mare offers three cabins, a spacious salon, and exceptional stability for the Ligurian and Tyrrhenian coasts.",
                "amenities": ["Seabob", "Paddleboards", "Fishing equipment", "Espresso machine", "Outdoor dining for 8", "WiFi", "Air conditioning"],
                "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
                "daily_rate_usd": "18000.00",
                "home_port": "Portofino, Italy",
                "is_available": True
            },
            {
                "pk": 4,
                "name": "Serenity Now",
                "size_category": "medium",
                "length_meters": "38.00",
                "guest_capacity": 10,
                "crew_count": 7,
                "description": "A Benetti 37m with a warm Tuscan interior featuring oak and marble throughout. Serenity Now accommodates 10 guests in five lavish staterooms with a master full-beam suite on the main deck.",
                "amenities": ["15-ft tender", "Two jet skis", "Seabobs", "Paddleboards", "Kayaks", "Diving equipment", "Gym", "WiFi", "Satellite TV", "Climate control"],
                "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
                "daily_rate_usd": "42000.00",
                "home_port": "Monaco",
                "is_available": True
            },
            {
                "pk": 5,
                "name": "Altitude",
                "size_category": "medium",
                "length_meters": "43.50",
                "guest_capacity": 10,
                "crew_count": 8,
                "description": "A striking Sunseeker 44m with a modern Scandinavian-inspired interior. Altitude's voluminous upper saloon, fold-down beach club, and 5 staterooms make her one of the most requested yachts in the Western Med.",
                "amenities": ["Beach club with swim platform", "Tender garage", "Two jet skis", "Seabob", "Flyboard", "Onboard gym", "Jacuzzi", "WiFi", "Stabilizers"],
                "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
                "daily_rate_usd": "55000.00",
                "home_port": "Palma de Mallorca, Spain",
                "is_available": True
            },
            {
                "pk": 6,
                "name": "Northern Star",
                "size_category": "medium",
                "length_meters": "47.00",
                "guest_capacity": 12,
                "crew_count": 9,
                "description": "A classic Feadship 47m blending the Dutch builder's legendary construction quality with a warm, contemporary interior. Northern Star's steel hull provides exceptional seakeeping for Adriatic islands.",
                "amenities": ["Stabilizers at anchor", "18-ft custom tender", "Diving setup", "Two jet skis", "Kayaks", "Sauna", "Jacuzzi", "WiFi", "Entertainment system"],
                "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
                "daily_rate_usd": "68000.00",
                "home_port": "Dubrovnik, Croatia",
                "is_available": True
            },
            {
                "pk": 7,
                "name": "Lady Sovereign",
                "size_category": "large",
                "length_meters": "58.00",
                "guest_capacity": 12,
                "crew_count": 14,
                "description": "An iconic Lurssen 58m combining German engineering precision with a palatial interior by Reymond Langton. Lady Sovereign's volume belies her elegant profile — the main salon alone measures over 80 sq metres.",
                "amenities": ["Full beach club", "Jacuzzi on deck", "Gymnasium", "Tender garage with 26-ft tender", "Three jet skis", "Seabobs", "Zero-speed stabilisers", "WiFi", "Satellite comms", "Wine cellar"],
                "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
                "daily_rate_usd": "115000.00",
                "home_port": "Antibes, France",
                "is_available": True
            },
            {
                "pk": 8,
                "name": "Aqua Blu",
                "size_category": "large",
                "length_meters": "62.00",
                "guest_capacity": 16,
                "crew_count": 15,
                "description": "A purpose-built expedition superyacht by Damen with ice-class capabilities. Aqua Blu carries a fleet of water toys and a submersible, making her ideal for remote destinations from the Maldives to Antarctica.",
                "amenities": ["Submarine", "Three dive compressors", "Full dive gear", "Multiple tenders", "Helicopter pad (H2)", "Jacuzzi", "Gym", "Sauna", "WiFi", "Stabilisers"],
                "image_url": "https://www.cruisemapper.com/images/ships/1645-43e816757a9.jpg",
                "daily_rate_usd": "135000.00",
                "home_port": "Fort Lauderdale, USA",
                "is_available": True
            },
            {
                "pk": 9,
                "name": "Titan",
                "size_category": "large",
                "length_meters": "73.00",
                "guest_capacity": 12,
                "crew_count": 20,
                "description": "A Feadship 73m masterpiece characterised by her low-profile exterior and extraordinary interior volume. Titan's guest-to-crew ratio of 1:1.7 ensures impeccable service for up to 12 guests across 5 suites.",
                "amenities": ["Beach club with infinity pool", "Submersible", "Four tenders", "Multiple jet skis", "Helideck", "Gymnasium", "Cinema room", "Wine cellar", "Spa with sauna", "Zero-speed stabilisers"],
                "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
                "daily_rate_usd": "165000.00",
                "home_port": "Dubai, UAE",
                "is_available": True
            },
            {
                "pk": 10,
                "name": "Jubilee",
                "size_category": "superyacht",
                "length_meters": "110.00",
                "guest_capacity": 28,
                "crew_count": 35,
                "description": "A Oceanco 110m superyacht inspired by ancient Greek architecture, featuring six decks of meticulously crafted spaces. Jubilee's interior by Lobanov Studio blends classical antiquity with contemporary luxury across an astounding 2,600 GRT.",
                "amenities": ["Swimming pool", "Two Jacuzzis", "Cinema", "Beach club", "Helipad", "Gymnasium with spa", "Submersible", "Dive centre", "Multiple tenders", "Zero-speed stabilisers", "WiFi & satellite comms", "Wine cellar", "Owner's and VIP decks"],
                "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
                "daily_rate_usd": "450000.00",
                "home_port": "Monaco",
                "is_available": True
            },
            {
                "pk": 11,
                "name": "Blue Ice",
                "size_category": "superyacht",
                "length_meters": "85.00",
                "guest_capacity": 12,
                "crew_count": 25,
                "description": "An ice-class Lurssen 85m expedition superyacht capable of navigating the Northwest Passage, Greenland, and Antarctica. Blue Ice marries rugged capability with world-class luxury across 5 decks.",
                "amenities": ["Ice-class hull", "Helipad with hangar", "Submersible", "RHIB tenders", "Complete dive centre", "Research lab", "Spa and sauna", "Cinema", "Zero-speed stabilisers", "Satellite internet"],
                "image_url": "https://images.unsplash.com/photo-1516132006923-4e4985a94ddb?w=800&q=80",
                "daily_rate_usd": "280000.00",
                "home_port": "Bergen, Norway",
                "is_available": True
            },
            {
                "pk": 12,
                "name": "Ocean Emerald",
                "size_category": "superyacht",
                "length_meters": "92.00",
                "guest_capacity": 18,
                "crew_count": 28,
                "description": "A Feadship 92m distinguished by her striking steel-blue hull and interiors by Alberto Pinto. Ocean Emerald's nine guest suites, sky lounge, and spectacular beach club have made her a fixture of the Med season.",
                "amenities": ["Sky lounge", "Main pool with bar", "Beach club spa", "Cinema", "Fully equipped gym", "Three tenders", "Two jet skis", "Seabobs", "Full dive centre", "Helipad", "Stabilisers", "Satellite comms"],
                "image_url": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
                "daily_rate_usd": "320000.00",
                "home_port": "Antibes, France",
                "is_available": True
            },
            {
                "pk": 13,
                "name": "Lady Christine",
                "size_category": "superyacht",
                "length_meters": "130.00",
                "guest_capacity": 26,
                "crew_count": 42,
                "description": "One of the world's most celebrated charter superyachts — a 130m Lürssen with seven decks and interiors by RWD. Lady Christine has circumnavigated the globe multiple times and can accommodate 26 guests across 13 suites.",
                "amenities": ["Infinity pool", "Beach club", "Spa and beauty salon", "Cinema for 20", "Two helipads", "Submarine", "Dive centre", "Multiple tenders + jet skis", "Fully equipped gym", "Owner's deck with private pool", "Zero-speed stabilisers"],
                "image_url": "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80",
                "daily_rate_usd": "620000.00",
                "home_port": "Nassau, Bahamas",
                "is_available": True
            }
        ]

        created_count = 0
        updated_count = 0
        
        for yacht_data in yachts_data:
            yacht, created = Yacht.objects.update_or_create(
                pk=yacht_data['pk'],
                defaults={
                    'name': yacht_data['name'],
                    'size_category': yacht_data['size_category'],
                    'length_meters': yacht_data['length_meters'],
                    'guest_capacity': yacht_data['guest_capacity'],
                    'crew_count': yacht_data['crew_count'],
                    'description': yacht_data['description'],
                    'amenities': yacht_data['amenities'],
                    'image_url': yacht_data['image_url'],
                    'daily_rate_usd': yacht_data['daily_rate_usd'],
                    'home_port': yacht_data['home_port'],
                    'is_available': yacht_data['is_available'],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Yachts: {created_count} created, {updated_count} updated')

    def seed_flight_bookings(self):
        """Seed flight booking data"""
        self.stdout.write('Seeding flight bookings...')
        
        bookings_data = [
            {
                "pk": 1,
                "reference": "bbcc9e7c-c765-4168-9f6a-abf5d0cb8e9a",
                "guest_name": "Jacob Juma",
                "guest_email": "jacobjuma@gmail.com",
                "guest_phone": "0757790873",
                "company": "Coca cola",
                "trip_type": "one_way",
                "origin_id": 27,
                "destination_id": 21,
                "departure_date": "2026-02-25",
                "departure_time": "03:10:00",
                "return_date": None,
                "passenger_count": 1,
                "aircraft_id": None,
                "special_requests": "Inflight catering",
                "catering_requested": False,
                "ground_transport_requested": False,
                "concierge_requested": False,
                "quoted_price_usd": "780000.00",
                "status": "confirmed",
                "created_at": "2026-02-23T21:07:25.786Z",
                "updated_at": "2026-02-23T21:09:51.383Z"
            },
            {
                "pk": 2,
                "reference": "049cde14-da07-4fba-a519-7412b701cdb6",
                "guest_name": "Jane Mary",
                "guest_email": "janemary@gmail.com",
                "guest_phone": "254112284902",
                "company": "",
                "trip_type": "one_way",
                "origin_id": 71,
                "destination_id": 48,
                "departure_date": "2026-02-25",
                "departure_time": "02:30:00",
                "return_date": None,
                "passenger_count": 1,
                "aircraft_id": 11,
                "special_requests": "none",
                "catering_requested": True,
                "ground_transport_requested": False,
                "concierge_requested": False,
                "quoted_price_usd": None,
                "status": "inquiry",
                "created_at": "2026-02-23T21:27:51.812Z",
                "updated_at": "2026-02-23T21:27:51.812Z"
            },
            {
                "pk": 3,
                "reference": "139c917b-b4de-4621-a477-9c71a8b59acf",
                "guest_name": "Akoko Valarine",
                "guest_email": "akokval@gmail.com",
                "guest_phone": "254736767263",
                "company": "",
                "trip_type": "one_way",
                "origin_id": 69,
                "destination_id": 62,
                "departure_date": "2026-02-25",
                "departure_time": "03:42:00",
                "return_date": None,
                "passenger_count": 1,
                "aircraft_id": 11,
                "special_requests": "In flight catering",
                "catering_requested": False,
                "ground_transport_requested": False,
                "concierge_requested": False,
                "quoted_price_usd": None,
                "status": "inquiry",
                "created_at": "2026-02-23T21:38:49.309Z",
                "updated_at": "2026-02-23T21:38:49.309Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for booking_data in bookings_data:
            # Get related objects
            origin = Airport.objects.get(pk=booking_data['origin_id'])
            destination = Airport.objects.get(pk=booking_data['destination_id'])
            aircraft = None
            if booking_data.get('aircraft_id'):
                try:
                    aircraft = Aircraft.objects.get(pk=booking_data['aircraft_id'])
                except Aircraft.DoesNotExist:
                    pass

            # Parse datetime fields
            departure_time = None
            if booking_data.get('departure_time'):
                time_parts = booking_data['departure_time'].split(':')
                departure_time = time(int(time_parts[0]), int(time_parts[1]), int(time_parts[2]) if len(time_parts) > 2 else 0)

            # Parse ISO datetime strings
            created_at = datetime.fromisoformat(booking_data['created_at'].replace('Z', '+00:00'))
            updated_at = datetime.fromisoformat(booking_data['updated_at'].replace('Z', '+00:00'))

            booking, created = FlightBooking.objects.update_or_create(
                pk=booking_data['pk'],
                defaults={
                    'reference': uuid.UUID(booking_data['reference']),
                    'guest_name': booking_data['guest_name'],
                    'guest_email': booking_data['guest_email'],
                    'guest_phone': booking_data['guest_phone'],
                    'company': booking_data['company'],
                    'trip_type': booking_data['trip_type'],
                    'origin': origin,
                    'destination': destination,
                    'departure_date': booking_data['departure_date'],
                    'departure_time': departure_time,
                    'return_date': booking_data['return_date'],
                    'passenger_count': booking_data['passenger_count'],
                    'aircraft': aircraft,
                    'special_requests': booking_data['special_requests'],
                    'catering_requested': booking_data['catering_requested'],
                    'ground_transport_requested': booking_data['ground_transport_requested'],
                    'concierge_requested': booking_data['concierge_requested'],
                    'quoted_price_usd': booking_data['quoted_price_usd'],
                    'status': booking_data['status'],
                    'created_at': created_at,
                    'updated_at': updated_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Flight Bookings: {created_count} created, {updated_count} updated')

    def seed_yacht_charters(self):
        """Seed yacht charter data"""
        self.stdout.write('Seeding yacht charters...')
        
        charters_data = [
            {
                "pk": 1,
                "reference": "7b18e6f8-8f02-4b10-a635-73b5d7f1a120",
                "guest_name": "Mike Mudachi",
                "guest_email": "mikemudathie@gmail.com",
                "guest_phone": "07467386872",
                "company": "",
                "yacht_id": 7,
                "departure_port": "Miami",
                "destination_port": "Mombasa",
                "charter_start": "2026-02-25",
                "charter_end": "2026-03-10",
                "guest_count": 12,
                "itinerary_description": "water sports",
                "special_requests": "celebrations",
                "quoted_price_usd": None,
                "status": "inquiry",
                "created_at": "2026-02-23T21:40:25.007Z",
                "updated_at": "2026-02-23T21:40:25.007Z"
            },
            {
                "pk": 2,
                "reference": "fdaeb8e6-e07b-49f5-b011-23810fc2d85b",
                "guest_name": "Mohammed",
                "guest_email": "Naserr@gmail.com",
                "guest_phone": "254959983202",
                "company": "",
                "yacht_id": 7,
                "departure_port": "Nyali",
                "destination_port": "Shanzu",
                "charter_start": "2026-02-25",
                "charter_end": "2026-03-05",
                "guest_count": 1,
                "itinerary_description": "None",
                "special_requests": "None",
                "quoted_price_usd": None,
                "status": "inquiry",
                "created_at": "2026-02-23T22:05:54.287Z",
                "updated_at": "2026-02-23T22:05:54.288Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for charter_data in charters_data:
            # Get related yacht
            yacht = None
            if charter_data.get('yacht_id'):
                try:
                    yacht = Yacht.objects.get(pk=charter_data['yacht_id'])
                except Yacht.DoesNotExist:
                    pass

            # Parse datetime fields
            created_at = datetime.fromisoformat(charter_data['created_at'].replace('Z', '+00:00'))
            updated_at = datetime.fromisoformat(charter_data['updated_at'].replace('Z', '+00:00'))

            charter, created = YachtCharter.objects.update_or_create(
                pk=charter_data['pk'],
                defaults={
                    'reference': uuid.UUID(charter_data['reference']),
                    'guest_name': charter_data['guest_name'],
                    'guest_email': charter_data['guest_email'],
                    'guest_phone': charter_data['guest_phone'],
                    'company': charter_data['company'],
                    'yacht': yacht,
                    'departure_port': charter_data['departure_port'],
                    'destination_port': charter_data['destination_port'],
                    'charter_start': charter_data['charter_start'],
                    'charter_end': charter_data['charter_end'],
                    'guest_count': charter_data['guest_count'],
                    'itinerary_description': charter_data['itinerary_description'],
                    'special_requests': charter_data['special_requests'],
                    'quoted_price_usd': charter_data['quoted_price_usd'],
                    'status': charter_data['status'],
                    'created_at': created_at,
                    'updated_at': updated_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Yacht Charters: {created_count} created, {updated_count} updated')

    def seed_lease_inquiries(self):
        """Seed lease inquiry data"""
        self.stdout.write('Seeding lease inquiries...')
        
        leases_data = [
            {
                "pk": 1,
                "reference": "f719c317-b7a7-41b8-8296-71c67fbfaca1",
                "guest_name": "Benson Koko",
                "guest_email": "bensonkoko@gmail.com",
                "guest_phone": "0757790983",
                "company": "Safaricom",
                "asset_type": "aircraft",
                "aircraft_id": None,
                "yacht_id": None,
                "lease_duration": "multi_year",
                "preferred_start_date": "2026-02-25",
                "budget_range": "50 USD",
                "usage_description": "Nairobi to mombasa",
                "additional_notes": "None",
                "status": "pending",
                "created_at": "2026-02-23T21:04:58.812Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for lease_data in leases_data:
            # Parse datetime fields
            created_at = datetime.fromisoformat(lease_data['created_at'].replace('Z', '+00:00'))

            lease, created = LeaseInquiry.objects.update_or_create(
                pk=lease_data['pk'],
                defaults={
                    'reference': uuid.UUID(lease_data['reference']),
                    'guest_name': lease_data['guest_name'],
                    'guest_email': lease_data['guest_email'],
                    'guest_phone': lease_data['guest_phone'],
                    'company': lease_data['company'],
                    'asset_type': lease_data['asset_type'],
                    'aircraft': None,
                    'yacht': None,
                    'lease_duration': lease_data['lease_duration'],
                    'preferred_start_date': lease_data['preferred_start_date'],
                    'budget_range': lease_data['budget_range'],
                    'usage_description': lease_data['usage_description'],
                    'additional_notes': lease_data['additional_notes'],
                    'status': lease_data['status'],
                    'created_at': created_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Lease Inquiries: {created_count} created, {updated_count} updated')

    def seed_contact_inquiries(self):
        """Seed contact inquiry data"""
        self.stdout.write('Seeding contact inquiries...')
        
        contacts_data = [
            {
                "pk": 1,
                "reference": "aedba113-0eb0-4472-8c29-1f7fd1daf1e3",
                "full_name": "Steve Ongera",
                "email": "steveongera@gmail.com",
                "phone": "254112298387",
                "company": "N/A",
                "subject": "careers",
                "message": "Attachment inquiry",
                "created_at": "2026-02-24T10:08:53.654Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for contact_data in contacts_data:
            # Parse datetime fields
            created_at = datetime.fromisoformat(contact_data['created_at'].replace('Z', '+00:00'))

            contact, created = ContactInquiry.objects.update_or_create(
                pk=contact_data['pk'],
                defaults={
                    'reference': uuid.UUID(contact_data['reference']),
                    'full_name': contact_data['full_name'],
                    'email': contact_data['email'],
                    'phone': contact_data['phone'],
                    'company': contact_data['company'],
                    'subject': contact_data['subject'],
                    'message': contact_data['message'],
                    'created_at': created_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Contact Inquiries: {created_count} created, {updated_count} updated')

    def seed_group_charter_inquiries(self):
        """Seed group charter inquiry data"""
        self.stdout.write('Seeding group charter inquiries...')
        
        group_charters_data = [
            {
                "pk": 1,
                "reference": "119a53c3-6647-420c-abec-99a5aed363e0",
                "contact_name": "Maina  Njenga",
                "email": "maina@gmail.com",
                "phone": "25478264573",
                "company": "N/A",
                "group_type": "corporate",
                "group_size": 16,
                "origin_description": "Nairobi",
                "destination_description": "Malindi",
                "departure_date": "2026-02-26",
                "return_date": None,
                "is_round_trip": False,
                "preferred_aircraft_category": "ultra_long",
                "catering_required": True,
                "ground_transport_required": True,
                "budget_range": "1400000",
                "additional_notes": "",
                "status": "pending",
                "created_at": "2026-02-24T10:07:34.992Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for gc_data in group_charters_data:
            # Parse datetime fields
            created_at = datetime.fromisoformat(gc_data['created_at'].replace('Z', '+00:00'))

            gc, created = GroupCharterInquiry.objects.update_or_create(
                pk=gc_data['pk'],
                defaults={
                    'reference': uuid.UUID(gc_data['reference']),
                    'contact_name': gc_data['contact_name'],
                    'email': gc_data['email'],
                    'phone': gc_data['phone'],
                    'company': gc_data['company'],
                    'group_type': gc_data['group_type'],
                    'group_size': gc_data['group_size'],
                    'origin_description': gc_data['origin_description'],
                    'destination_description': gc_data['destination_description'],
                    'departure_date': gc_data['departure_date'],
                    'return_date': gc_data['return_date'],
                    'is_round_trip': gc_data['is_round_trip'],
                    'preferred_aircraft_category': gc_data['preferred_aircraft_category'],
                    'catering_required': gc_data['catering_required'],
                    'ground_transport_required': gc_data['ground_transport_required'],
                    'budget_range': gc_data['budget_range'],
                    'additional_notes': gc_data['additional_notes'],
                    'status': gc_data['status'],
                    'created_at': created_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Group Charter Inquiries: {created_count} created, {updated_count} updated')

    def seed_air_cargo_inquiries(self):
        """Seed air cargo inquiry data"""
        self.stdout.write('Seeding air cargo inquiries...')
        
        cargo_data = [
            {
                "pk": 1,
                "reference": "78cd1122-7537-4d97-bbb2-be6089022544",
                "contact_name": "Kimani Ichungwa",
                "email": "kimaniichungwa@gmail.com",
                "phone": "25472773678",
                "company": "N/A",
                "cargo_type": "pharma",
                "cargo_description": "I want to ship military medicine higly flammable from Nairobi kenya to Pakistan",
                "weight_kg": "450.00",
                "volume_m3": "2.80",
                "dimensions": "120 x 670",
                "origin_description": "Nairobi",
                "destination_description": "Pakistan",
                "pickup_date": "2026-02-27",
                "urgency": "express",
                "is_hazardous": True,
                "requires_temperature_control": True,
                "insurance_required": False,
                "customs_assistance_needed": False,
                "additional_notes": "N/A",
                "status": "pending",
                "created_at": "2026-02-24T10:11:22.274Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for cargo in cargo_data:
            # Parse datetime fields
            created_at = datetime.fromisoformat(cargo['created_at'].replace('Z', '+00:00'))

            cargo_inquiry, created = AirCargoInquiry.objects.update_or_create(
                pk=cargo['pk'],
                defaults={
                    'reference': uuid.UUID(cargo['reference']),
                    'contact_name': cargo['contact_name'],
                    'email': cargo['email'],
                    'phone': cargo['phone'],
                    'company': cargo['company'],
                    'cargo_type': cargo['cargo_type'],
                    'cargo_description': cargo['cargo_description'],
                    'weight_kg': cargo['weight_kg'],
                    'volume_m3': cargo['volume_m3'],
                    'dimensions': cargo['dimensions'],
                    'origin_description': cargo['origin_description'],
                    'destination_description': cargo['destination_description'],
                    'pickup_date': cargo['pickup_date'],
                    'urgency': cargo['urgency'],
                    'is_hazardous': cargo['is_hazardous'],
                    'requires_temperature_control': cargo['requires_temperature_control'],
                    'insurance_required': cargo['insurance_required'],
                    'customs_assistance_needed': cargo['customs_assistance_needed'],
                    'additional_notes': cargo['additional_notes'],
                    'status': cargo['status'],
                    'created_at': created_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Air Cargo Inquiries: {created_count} created, {updated_count} updated')

    def seed_aircraft_sales_inquiries(self):
        """Seed aircraft sales inquiry data"""
        self.stdout.write('Seeding aircraft sales inquiries...')
        
        sales_data = [
            {
                "pk": 1,
                "reference": "a26d4c0f-f78c-4241-8aae-68f69a1d4d64",
                "contact_name": "Abdi Malik sumeha",
                "email": "abdi@gmail.com",
                "phone": "254176526783",
                "company": "N/A",
                "inquiry_type": "buy",
                "preferred_category": "light",
                "preferred_make_model": "Gulfstream",
                "budget_range": "under_2m",
                "new_or_pre_owned": "new",
                "aircraft_make": "",
                "aircraft_model": "",
                "year_of_manufacture": None,
                "serial_number": "",
                "total_flight_hours": None,
                "asking_price_usd": None,
                "message": "N/A",
                "status": "pending",
                "created_at": "2026-02-24T10:13:16.773Z"
            }
        ]

        created_count = 0
        updated_count = 0
        
        for sale in sales_data:
            # Parse datetime fields
            created_at = datetime.fromisoformat(sale['created_at'].replace('Z', '+00:00'))

            sale_inquiry, created = AircraftSalesInquiry.objects.update_or_create(
                pk=sale['pk'],
                defaults={
                    'reference': uuid.UUID(sale['reference']),
                    'contact_name': sale['contact_name'],
                    'email': sale['email'],
                    'phone': sale['phone'],
                    'company': sale['company'],
                    'inquiry_type': sale['inquiry_type'],
                    'preferred_category': sale['preferred_category'],
                    'preferred_make_model': sale['preferred_make_model'],
                    'budget_range': sale['budget_range'],
                    'new_or_pre_owned': sale['new_or_pre_owned'],
                    'aircraft_make': sale['aircraft_make'],
                    'aircraft_model': sale['aircraft_model'],
                    'year_of_manufacture': sale['year_of_manufacture'],
                    'serial_number': sale['serial_number'],
                    'total_flight_hours': sale['total_flight_hours'],
                    'asking_price_usd': sale['asking_price_usd'],
                    'message': sale['message'],
                    'status': sale['status'],
                    'created_at': created_at,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(f'  Aircraft Sales Inquiries: {created_count} created, {updated_count} updated')