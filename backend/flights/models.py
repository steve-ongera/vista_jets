from django.db import models
import uuid


class Airport(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.city}, {self.country}"


class Aircraft(models.Model):
    CATEGORY_CHOICES = [
        ('light', 'Light Jet'),
        ('midsize', 'Midsize Jet'),
        ('super_midsize', 'Super Midsize Jet'),
        ('heavy', 'Heavy Jet'),
        ('ultra_long', 'Ultra Long Range'),
        ('vip_airliner', 'VIP Airliner'),
    ]
    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    passenger_capacity = models.PositiveIntegerField()
    range_km = models.PositiveIntegerField(help_text="Range in kilometers")
    cruise_speed_kmh = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True)
    hourly_rate_usd = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.category})"


class Yacht(models.Model):
    SIZE_CHOICES = [
        ('small', 'Small (under 30m)'),
        ('medium', 'Medium (30-50m)'),
        ('large', 'Large (50-80m)'),
        ('superyacht', 'Superyacht (80m+)'),
    ]
    name = models.CharField(max_length=100)
    size_category = models.CharField(max_length=20, choices=SIZE_CHOICES)
    length_meters = models.DecimalField(max_digits=6, decimal_places=2)
    guest_capacity = models.PositiveIntegerField()
    crew_count = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True)
    daily_rate_usd = models.DecimalField(max_digits=12, decimal_places=2)
    home_port = models.CharField(max_length=200)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.size_category})"


class FlightBooking(models.Model):
    STATUS_CHOICES = [
        ('inquiry', 'Inquiry'),
        ('quoted', 'Quoted'),
        ('confirmed', 'Confirmed'),
        ('in_flight', 'In Flight'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    TRIP_TYPE_CHOICES = [
        ('one_way', 'One Way'),
        ('round_trip', 'Round Trip'),
        ('multi_leg', 'Multi-Leg'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    # Guest info (no account required)
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    # Flight details
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default='one_way')
    origin = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='departures')
    destination = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='arrivals')
    departure_date = models.DateField()
    departure_time = models.TimeField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    passenger_count = models.PositiveIntegerField()
    aircraft = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True)

    # Preferences & extras
    special_requests = models.TextField(blank=True)
    catering_requested = models.BooleanField(default=False)
    ground_transport_requested = models.BooleanField(default=False)
    concierge_requested = models.BooleanField(default=False)

    # Pricing
    quoted_price_usd = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inquiry')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Flight {self.reference} | {self.origin.code} → {self.destination.code} | {self.guest_name}"


class FlightLeg(models.Model):
    """For multi-leg flights"""
    booking = models.ForeignKey(FlightBooking, on_delete=models.CASCADE, related_name='legs')
    leg_number = models.PositiveIntegerField()
    origin = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='leg_departures')
    destination = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='leg_arrivals')
    departure_date = models.DateField()
    departure_time = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ['leg_number']


class YachtCharter(models.Model):
    STATUS_CHOICES = [
        ('inquiry', 'Inquiry'),
        ('quoted', 'Quoted'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active Charter'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    yacht = models.ForeignKey(Yacht, on_delete=models.SET_NULL, null=True, blank=True)
    departure_port = models.CharField(max_length=200)
    destination_port = models.CharField(max_length=200, blank=True)
    charter_start = models.DateField()
    charter_end = models.DateField()
    guest_count = models.PositiveIntegerField()
    itinerary_description = models.TextField(blank=True)
    special_requests = models.TextField(blank=True)

    quoted_price_usd = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inquiry')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Yacht {self.reference} | {self.guest_name}"


class LeaseInquiry(models.Model):
    ASSET_TYPE_CHOICES = [
        ('aircraft', 'Aircraft'),
        ('yacht', 'Yacht'),
    ]
    LEASE_DURATION_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
        ('multi_year', 'Multi-Year'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    aircraft = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True)
    yacht = models.ForeignKey(Yacht, on_delete=models.SET_NULL, null=True, blank=True)
    lease_duration = models.CharField(max_length=20, choices=LEASE_DURATION_CHOICES)
    preferred_start_date = models.DateField()
    budget_range = models.CharField(max_length=100, blank=True)
    usage_description = models.TextField(blank=True)
    additional_notes = models.TextField(blank=True)

    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lease {self.reference} | {self.asset_type} | {self.guest_name}"


class FlightInquiry(models.Model):
    """General flight inquiry - no specific dates, just exploring options"""
    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=30, blank=True)

    origin_description = models.CharField(max_length=300, help_text="E.g. 'New York area' or 'JFK'")
    destination_description = models.CharField(max_length=300)
    approximate_date = models.CharField(max_length=100, blank=True)
    passenger_count = models.PositiveIntegerField(default=1)
    preferred_aircraft_category = models.CharField(max_length=30, blank=True)
    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry {self.reference} | {self.origin_description} → {self.destination_description}"


# ── ADD THESE TO YOUR EXISTING models.py ──────────────────────────────────────

class ContactInquiry(models.Model):
    SUBJECT_CHOICES = [
        ('general', 'General Inquiry'),
        ('support', 'Customer Support'),
        ('media', 'Media & Press'),
        ('partnership', 'Partnership'),
        ('careers', 'Careers'),
        ('other', 'Other'),
    ]
    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)
    subject = models.CharField(max_length=30, choices=SUBJECT_CHOICES, default='general')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contact {self.reference} | {self.full_name} | {self.subject}"


class GroupCharterInquiry(models.Model):
    GROUP_TYPE_CHOICES = [
        ('corporate', 'Corporate / Business'),
        ('sports_team', 'Sports Team'),
        ('entertainment', 'Entertainment / Film'),
        ('incentive', 'Incentive Group'),
        ('wedding', 'Wedding Party'),
        ('government', 'Government / Diplomatic'),
        ('other', 'Other'),
    ]
    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    group_type = models.CharField(max_length=30, choices=GROUP_TYPE_CHOICES)
    group_size = models.PositiveIntegerField()
    origin_description = models.CharField(max_length=300)
    destination_description = models.CharField(max_length=300)
    departure_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    is_round_trip = models.BooleanField(default=False)

    preferred_aircraft_category = models.CharField(max_length=30, blank=True)
    catering_required = models.BooleanField(default=False)
    ground_transport_required = models.BooleanField(default=False)
    budget_range = models.CharField(max_length=100, blank=True)
    additional_notes = models.TextField(blank=True)

    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group Charter {self.reference} | {self.group_type} | {self.group_size} pax"


class AirCargoInquiry(models.Model):
    CARGO_TYPE_CHOICES = [
        ('general', 'General Cargo'),
        ('perishables', 'Perishables / Fresh Produce'),
        ('pharma', 'Pharmaceuticals / Medical'),
        ('dangerous_goods', 'Dangerous Goods (DG)'),
        ('live_animals', 'Live Animals'),
        ('artwork', 'Artwork / High Value'),
        ('automotive', 'Automotive / Vehicles'),
        ('oversized', 'Oversized / Heavy Lift'),
        ('humanitarian', 'Humanitarian / Aid'),
        ('other', 'Other'),
    ]
    URGENCY_CHOICES = [
        ('standard', 'Standard (3-5 days)'),
        ('express', 'Express (24-48 hrs)'),
        ('critical', 'Critical / AOG (same day)'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    cargo_type = models.CharField(max_length=30, choices=CARGO_TYPE_CHOICES)
    cargo_description = models.TextField()
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    volume_m3 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=200, blank=True, help_text="L x W x H in cm")

    origin_description = models.CharField(max_length=300)
    destination_description = models.CharField(max_length=300)
    pickup_date = models.DateField(null=True, blank=True)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='standard')

    is_hazardous = models.BooleanField(default=False)
    requires_temperature_control = models.BooleanField(default=False)
    insurance_required = models.BooleanField(default=False)
    customs_assistance_needed = models.BooleanField(default=False)

    additional_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Air Cargo {self.reference} | {self.cargo_type} | {self.origin_description} → {self.destination_description}"


class AircraftSalesInquiry(models.Model):
    INQUIRY_TYPE_CHOICES = [
        ('buy', 'Looking to Buy'),
        ('sell', 'Looking to Sell'),
        ('trade', 'Trade / Part Exchange'),
        ('valuation', 'Valuation Only'),
    ]
    BUDGET_CHOICES = [
        ('under_2m', 'Under $2M'),
        ('2m_5m', '$2M – $5M'),
        ('5m_15m', '$5M – $15M'),
        ('15m_30m', '$15M – $30M'),
        ('30m_60m', '$30M – $60M'),
        ('over_60m', 'Over $60M'),
        ('not_disclosed', 'Prefer not to say'),
    ]

    reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)

    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES)

    # For buyers
    preferred_category = models.CharField(max_length=30, blank=True)
    preferred_make_model = models.CharField(max_length=200, blank=True)
    budget_range = models.CharField(max_length=20, choices=BUDGET_CHOICES, blank=True)
    new_or_pre_owned = models.CharField(max_length=20, choices=[('new','New'),('pre_owned','Pre-Owned'),('either','Either')], default='either')

    # For sellers
    aircraft_make = models.CharField(max_length=100, blank=True)
    aircraft_model = models.CharField(max_length=100, blank=True)
    year_of_manufacture = models.PositiveIntegerField(null=True, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    total_flight_hours = models.PositiveIntegerField(null=True, blank=True)
    asking_price_usd = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Aircraft Sale {self.reference} | {self.inquiry_type} | {self.contact_name}"