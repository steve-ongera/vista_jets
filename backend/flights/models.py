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
