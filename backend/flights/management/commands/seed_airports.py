from django.core.management.base import BaseCommand
from flights.models import Airport


AIRPORTS = [
    # --- Kenya Airways (KQ) Primary Hubs & Key Routes ---
    {"code": "NBO", "name": "Jomo Kenyatta International Airport", "city": "Nairobi", "country": "Kenya", "latitude": -1.319167, "longitude": 36.927778},
    {"code": "MBA", "name": "Moi International Airport", "city": "Mombasa", "country": "Kenya", "latitude": -4.034833, "longitude": 39.594253},
    {"code": "KIS", "name": "Kisumu International Airport", "city": "Kisumu", "country": "Kenya", "latitude": -0.086139, "longitude": 34.728956},
    {"code": "EDL", "name": "Eldoret International Airport", "city": "Eldoret", "country": "Kenya", "latitude": 0.404458, "longitude": 35.238928},

    # --- Kenya Domestic Airports & Airstrips ---
    {"code": "WIL", "name": "Wilson Airport", "city": "Nairobi", "country": "Kenya", "latitude": -1.321719, "longitude": 36.814833},
    {"code": "MYD", "name": "Malindi Airport", "city": "Malindi", "country": "Kenya", "latitude": -3.229306, "longitude": 40.101667},
    {"code": "LAU", "name": "Lamu Airport", "city": "Lamu", "country": "Kenya", "latitude": -2.252417, "longitude": 40.913097},
    {"code": "UKA", "name": "Ukunda Airstrip", "city": "Ukunda (Diani)", "country": "Kenya", "latitude": -4.293333, "longitude": 39.571111},
    {"code": "GGM", "name": "Kakamega Airport", "city": "Kakamega", "country": "Kenya", "latitude": 0.271333, "longitude": 34.787333},
    {"code": "HOA", "name": "Hola Airport", "city": "Hola", "country": "Kenya", "latitude": -1.521978, "longitude": 40.004517},
    {"code": "KEY", "name": "Kericho Airport", "city": "Kericho", "country": "Kenya", "latitude": -0.389000, "longitude": 35.208000},
    {"code": "LKG", "name": "Lokichoggio Airport", "city": "Lokichoggio", "country": "Kenya", "latitude": 4.204117, "longitude": 34.348183},
    {"code": "LBK", "name": "Liboi Airport", "city": "Liboi", "country": "Kenya", "latitude": 0.352778, "longitude": 40.875278},
    {"code": "MRE", "name": "Mara Serena Airport", "city": "Masai Mara", "country": "Kenya", "latitude": -1.406083, "longitude": 35.008083},
    {"code": "OLX", "name": "Olkiombo Airstrip", "city": "Masai Mara", "country": "Kenya", "latitude": -1.413333, "longitude": 35.003333},
    {"code": "KEU", "name": "Keekorok Airstrip", "city": "Masai Mara", "country": "Kenya", "latitude": -1.589444, "longitude": 35.274167},
    {"code": "AMH", "name": "Amboseli Airport", "city": "Amboseli", "country": "Kenya", "latitude": -2.645039, "longitude": 37.253136},
    {"code": "NUU", "name": "Nakuru Airport", "city": "Nakuru", "country": "Kenya", "latitude": -0.298061, "longitude": 36.159700},
    {"code": "NYK", "name": "Nanyuki Airport", "city": "Nanyuki", "country": "Kenya", "latitude": 0.062406, "longitude": 37.041031},
    {"code": "NDE", "name": "Mandera Airport", "city": "Mandera", "country": "Kenya", "latitude": 3.933139, "longitude": 41.856583},
    {"code": "WJR", "name": "Wajir Airport", "city": "Wajir", "country": "Kenya", "latitude": 1.732633, "longitude": 40.091600},
    {"code": "GAS", "name": "Garissa Airport", "city": "Garissa", "country": "Kenya", "latitude": -0.463500, "longitude": 39.648333},
    {"code": "ILU", "name": "Kilaguni Airstrip", "city": "Tsavo West", "country": "Kenya", "latitude": -2.910000, "longitude": 38.062222},
    {"code": "KTL", "name": "Kitale Airport", "city": "Kitale", "country": "Kenya", "latitude": 1.001556, "longitude": 34.958556},
    {"code": "MUM", "name": "Mumias Airport", "city": "Mumias", "country": "Kenya", "latitude": 0.337222, "longitude": 34.492500},
    {"code": "LYB", "name": "Loyangalani Airport", "city": "Loyangalani", "country": "Kenya", "latitude": 2.753611, "longitude": 36.718889},
    {"code": "RBT", "name": "Marsabit Airport", "city": "Marsabit", "country": "Kenya", "latitude": 2.338306, "longitude": 37.999550},
    {"code": "BMQ", "name": "Bamburi Airport", "city": "Bamburi", "country": "Kenya", "latitude": -3.972222, "longitude": 39.725833},
    {"code": "OYL", "name": "Moyale Airport", "city": "Moyale", "country": "Kenya", "latitude": 3.469722, "longitude": 39.101389},
    {"code": "KLK", "name": "Kalokol Airport", "city": "Kalokol", "country": "Kenya", "latitude": 3.512778, "longitude": 35.840833},
    {"code": "SRX", "name": "Samburu Airport", "city": "Samburu", "country": "Kenya", "latitude": 0.530583, "longitude": 37.534000},
    {"code": "UAS", "name": "Buffalo Spring Airstrip", "city": "Samburu", "country": "Kenya", "latitude": 0.616667, "longitude": 37.550000},
    {"code": "VPG", "name": "Vipingo Airstrip", "city": "Vipingo", "country": "Kenya", "latitude": -3.720556, "longitude": 39.831944},
    {"code": "NBI", "name": "Nairobi West Airport", "city": "Nairobi", "country": "Kenya", "latitude": -1.327500, "longitude": 36.830278},
    {"code": "LKU", "name": "Lake Rudolf Airport", "city": "Turkana", "country": "Kenya", "latitude": 3.366667, "longitude": 35.966667},
    {"code": "EYS", "name": "Eliye Springs Airstrip", "city": "Eliye Springs", "country": "Kenya", "latitude": 3.218333, "longitude": 36.001667},
    {"code": "KTJ", "name": "Kichwa Tembo Airstrip", "city": "Masai Mara", "country": "Kenya", "latitude": -1.257778, "longitude": 34.998333},
    {"code": "MKF", "name": "Maktau Airstrip", "city": "Maktau", "country": "Kenya", "latitude": -3.660000, "longitude": 38.175000},

    # --- KQ African Destinations ---
    {"code": "ADD", "name": "Addis Ababa Bole International Airport", "city": "Addis Ababa", "country": "Ethiopia", "latitude": 8.977889, "longitude": 38.799319},
    {"code": "LOS", "name": "Murtala Muhammed International Airport", "city": "Lagos", "country": "Nigeria", "latitude": 6.577370, "longitude": 3.321156},
    {"code": "ABV", "name": "Nnamdi Azikiwe International Airport", "city": "Abuja", "country": "Nigeria", "latitude": 9.006792, "longitude": 7.263172},
    {"code": "ACC", "name": "Kotoka International Airport", "city": "Accra", "country": "Ghana", "latitude": 5.605186, "longitude": -0.166786},
    {"code": "DAR", "name": "Julius Nyerere International Airport", "city": "Dar es Salaam", "country": "Tanzania", "latitude": -6.878111, "longitude": 39.202625},
    {"code": "JRO", "name": "Kilimanjaro International Airport", "city": "Kilimanjaro", "country": "Tanzania", "latitude": -3.429406, "longitude": 37.074461},
    {"code": "ZNZ", "name": "Abeid Amani Karume International Airport", "city": "Zanzibar", "country": "Tanzania", "latitude": -6.222025, "longitude": 39.224886},
    {"code": "EBB", "name": "Entebbe International Airport", "city": "Entebbe", "country": "Uganda", "latitude": 0.042386, "longitude": 32.443503},
    {"code": "KGL", "name": "Kigali International Airport", "city": "Kigali", "country": "Rwanda", "latitude": -1.968628, "longitude": 30.139444},
    {"code": "BKO", "name": "Modibo Keita International Airport", "city": "Bamako", "country": "Mali", "latitude": 12.533544, "longitude": -7.949944},
    {"code": "CMN", "name": "Mohammed V International Airport", "city": "Casablanca", "country": "Morocco", "latitude": 33.367500, "longitude": -7.589700},
    {"code": "CAI", "name": "Cairo International Airport", "city": "Cairo", "country": "Egypt", "latitude": 30.121944, "longitude": 31.405556},
    {"code": "DKR", "name": "Blaise Diagne International Airport", "city": "Dakar", "country": "Senegal", "latitude": 14.670833, "longitude": -17.072778},
    {"code": "DLA", "name": "Douala International Airport", "city": "Douala", "country": "Cameroon", "latitude": 4.006081, "longitude": 9.719481},
    {"code": "LUN", "name": "Kenneth Kaunda International Airport", "city": "Lusaka", "country": "Zambia", "latitude": -15.330833, "longitude": 28.452722},
    {"code": "HRE", "name": "Robert Gabriel Mugabe International Airport", "city": "Harare", "country": "Zimbabwe", "latitude": -17.931806, "longitude": 31.092847},
    {"code": "CPT", "name": "Cape Town International Airport", "city": "Cape Town", "country": "South Africa", "latitude": -33.964806, "longitude": 18.601500},
    {"code": "JNB", "name": "O.R. Tambo International Airport", "city": "Johannesburg", "country": "South Africa", "latitude": -26.133694, "longitude": 28.242317},
    {"code": "MPM", "name": "Maputo International Airport", "city": "Maputo", "country": "Mozambique", "latitude": -25.920836, "longitude": 32.572606},
    {"code": "BJL", "name": "Banjul International Airport", "city": "Banjul", "country": "Gambia", "latitude": 13.338044, "longitude": -16.652208},
    {"code": "FIH", "name": "Ndjili International Airport", "city": "Kinshasa", "country": "DR Congo", "latitude": -4.385750, "longitude": 15.444600},
    {"code": "HAH", "name": "Prince Said Ibrahim International Airport", "city": "Moroni", "country": "Comoros", "latitude": -11.533661, "longitude": 43.271900},
    {"code": "TNR", "name": "Ivato International Airport", "city": "Antananarivo", "country": "Madagascar", "latitude": -18.796917, "longitude": 47.478806},
    {"code": "SSG", "name": "Santa Isabel Airport", "city": "Malabo", "country": "Equatorial Guinea", "latitude": 3.755267, "longitude": 8.708717},
    {"code": "BZV", "name": "Maya-Maya Airport", "city": "Brazzaville", "country": "Republic of Congo", "latitude": -4.251700, "longitude": 15.253100},
    {"code": "LBV", "name": "Libreville International Airport", "city": "Libreville", "country": "Gabon", "latitude": 0.458600, "longitude": 9.412283},
    {"code": "MGQ", "name": "Aden Adde International Airport", "city": "Mogadishu", "country": "Somalia", "latitude": 2.014439, "longitude": 45.304667},
    {"code": "JIB", "name": "Djibouti-Ambouli International Airport", "city": "Djibouti", "country": "Djibouti", "latitude": 11.546981, "longitude": 43.159447},
    {"code": "ASM", "name": "Asmara International Airport", "city": "Asmara", "country": "Eritrea", "latitude": 15.291853, "longitude": 38.910711},

    # --- KQ International (Long-Haul) ---
    {"code": "LHR", "name": "London Heathrow Airport", "city": "London", "country": "United Kingdom", "latitude": 51.477500, "longitude": -0.461389},
    {"code": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France", "latitude": 49.009722, "longitude": 2.547778},
    {"code": "AMS", "name": "Amsterdam Airport Schiphol", "city": "Amsterdam", "country": "Netherlands", "latitude": 52.308600, "longitude": 4.763889},
    {"code": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt", "country": "Germany", "latitude": 50.033333, "longitude": 8.570556},
    {"code": "DXB", "name": "Dubai International Airport", "city": "Dubai", "country": "UAE", "latitude": 25.252778, "longitude": 55.364444},
    {"code": "BOM", "name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "country": "India", "latitude": 19.088700, "longitude": 72.867900},
    {"code": "DEL", "name": "Indira Gandhi International Airport", "city": "New Delhi", "country": "India", "latitude": 28.566500, "longitude": 77.103100},
    {"code": "GUA", "name": "La Aurora International Airport", "city": "Guatemala City", "country": "Guatemala", "latitude": 14.583272, "longitude": -90.527475},
    {"code": "HKG", "name": "Hong Kong International Airport", "city": "Hong Kong", "country": "China", "latitude": 22.308900, "longitude": 113.914603},
    {"code": "BKK", "name": "Suvarnabhumi Airport", "city": "Bangkok", "country": "Thailand", "latitude": 13.681108, "longitude": 100.747283},
    {"code": "PVG", "name": "Shanghai Pudong International Airport", "city": "Shanghai", "country": "China", "latitude": 31.143378, "longitude": 121.805214},
    {"code": "GRU", "name": "São Paulo–Guarulhos International Airport", "city": "São Paulo", "country": "Brazil", "latitude": -23.435556, "longitude": -46.473056},
    {"code": "JFK", "name": "John F. Kennedy International Airport", "city": "New York", "country": "USA", "latitude": 40.639722, "longitude": -73.778889},
    {"code": "IAD", "name": "Washington Dulles International Airport", "city": "Washington D.C.", "country": "USA", "latitude": 38.944444, "longitude": -77.455833},

    # --- Other Major International Airports ---
    {"code": "SIN", "name": "Singapore Changi Airport", "city": "Singapore", "country": "Singapore", "latitude": 1.359167, "longitude": 103.989444},
    {"code": "DOH", "name": "Hamad International Airport", "city": "Doha", "country": "Qatar", "latitude": 25.273056, "longitude": 51.608056},
    {"code": "AUH", "name": "Abu Dhabi International Airport", "city": "Abu Dhabi", "country": "UAE", "latitude": 24.432972, "longitude": 54.651138},
    {"code": "IST", "name": "Istanbul Airport", "city": "Istanbul", "country": "Turkey", "latitude": 41.275278, "longitude": 28.751944},
    {"code": "MUC", "name": "Munich Airport", "city": "Munich", "country": "Germany", "latitude": 48.353889, "longitude": 11.786111},
    {"code": "MAD", "name": "Adolfo Suárez Madrid–Barajas Airport", "city": "Madrid", "country": "Spain", "latitude": 40.493556, "longitude": -3.566764},
    {"code": "FCO", "name": "Leonardo da Vinci International Airport", "city": "Rome", "country": "Italy", "latitude": 41.804475, "longitude": 12.250797},
    {"code": "ZRH", "name": "Zurich Airport", "city": "Zurich", "country": "Switzerland", "latitude": 47.464722, "longitude": 8.549167},
    {"code": "CPH", "name": "Copenhagen Airport", "city": "Copenhagen", "country": "Denmark", "latitude": 55.617917, "longitude": 12.655972},
    {"code": "SYD", "name": "Sydney Kingsford Smith Airport", "city": "Sydney", "country": "Australia", "latitude": -33.946111, "longitude": 151.177222},
    {"code": "NRT", "name": "Narita International Airport", "city": "Tokyo", "country": "Japan", "latitude": 35.764722, "longitude": 140.386389},
    {"code": "ICN", "name": "Incheon International Airport", "city": "Seoul", "country": "South Korea", "latitude": 37.469075, "longitude": 126.450517},
    {"code": "LAX", "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "USA", "latitude": 33.942536, "longitude": -118.408075},
    {"code": "ORD", "name": "O'Hare International Airport", "city": "Chicago", "country": "USA", "latitude": 41.974162, "longitude": -87.907321},
    {"code": "YYZ", "name": "Toronto Pearson International Airport", "city": "Toronto", "country": "Canada", "latitude": 43.677222, "longitude": -79.630556},
]


class Command(BaseCommand):
    help = "Seed airports — skips any airport whose code already exists."

    def handle(self, *args, **kwargs):
        created_count = 0
        skipped_count = 0

        for airport_data in AIRPORTS:
            code = airport_data["code"]

            if Airport.objects.filter(code=code).exists():
                self.stdout.write(self.style.WARNING(f"  SKIP  {code} — already exists"))
                skipped_count += 1
            else:
                Airport.objects.create(**airport_data)
                self.stdout.write(self.style.SUCCESS(f"  ADD   {code} — {airport_data['city']}, {airport_data['country']}"))
                created_count += 1

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Done. {created_count} airport(s) added, {skipped_count} skipped."))