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
    
    
    
    

import uuid
from django.db import models

from django.conf import settings
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# CUSTOM USER  (replaces default User — set AUTH_USER_MODEL = 'flights.User')
# ─────────────────────────────────────────────────────────────────────────────
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Add your custom fields here
    ROLE_CHOICES = [
        ('client', 'Membership Client'),
        ('owner', 'Fleet Owner'),
        ('admin', 'Platform Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username

# ─────────────────────────────────────────────────────────────────────────────
# MEMBERSHIP TIER
# ─────────────────────────────────────────────────────────────────────────────
class MembershipTier(models.Model):
    TIER_CHOICES = [
        ('basic',     'Basic'),
        ('premium',   'Premium'),
        ('corporate', 'Corporate'),
    ]
    name                  = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    display_name          = models.CharField(max_length=100)
    monthly_fee_usd       = models.DecimalField(max_digits=10, decimal_places=2)
    annual_fee_usd        = models.DecimalField(max_digits=10, decimal_places=2)
    hourly_discount_pct   = models.DecimalField(max_digits=5, decimal_places=2, default=0,
                                                 help_text="% discount off standard hourly rate")
    priority_booking      = models.BooleanField(default=False)
    dedicated_support     = models.BooleanField(default=False)
    exclusive_listings    = models.BooleanField(default=False)
    max_monthly_bookings  = models.IntegerField(default=10, help_text="0 = unlimited")
    description           = models.TextField(blank=True)
    features_list         = models.JSONField(default=list, help_text="List of feature strings")
    is_active             = models.BooleanField(default=True)

    def __str__(self):
        return self.display_name


# ─────────────────────────────────────────────────────────────────────────────
# CLIENT MEMBERSHIP
# ─────────────────────────────────────────────────────────────────────────────
class Membership(models.Model):
    STATUS_CHOICES = [
        ('active',     'Active'),
        ('expired',    'Expired'),
        ('suspended',  'Suspended'),
        ('cancelled',  'Cancelled'),
        ('pending',    'Pending Payment'),
    ]
    BILLING_CHOICES = [
        ('monthly', 'Monthly'),
        ('annual',  'Annual'),
    ]
    reference      = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                          related_name='membership')
    tier           = models.ForeignKey(MembershipTier, on_delete=models.PROTECT)
    status         = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    billing_cycle  = models.CharField(max_length=10, choices=BILLING_CHOICES, default='annual')
    start_date     = models.DateField(null=True, blank=True)
    end_date       = models.DateField(null=True, blank=True)
    auto_renew     = models.BooleanField(default=True)
    stripe_sub_id  = models.CharField(max_length=200, blank=True,
                                       help_text="Stripe subscription ID")
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    @property
    def is_active(self):
        return self.status == 'active' and (self.end_date is None or self.end_date >= timezone.now().date())

    @property
    def days_remaining(self):
        if self.end_date:
            delta = (self.end_date - timezone.now().date()).days
            return max(delta, 0)
        return None

    def __str__(self):
        return f"{self.user.username} – {self.tier.display_name} ({self.status})"


# ─────────────────────────────────────────────────────────────────────────────
# MARKETPLACE AIRCRAFT  (owned by fleet owners, separate from charter Aircraft)
# ─────────────────────────────────────────────────────────────────────────────
class MarketplaceAircraft(models.Model):
    STATUS_CHOICES = [
        ('available',    'Available'),
        ('in_flight',    'In Flight'),
        ('maintenance',  'Under Maintenance'),
        ('inactive',     'Inactive'),
        ('pending',      'Pending Approval'),
    ]
    CATEGORY_CHOICES = [
        ('light',         'Light Jet'),
        ('midsize',       'Midsize Jet'),
        ('super_midsize', 'Super Midsize'),
        ('heavy',         'Heavy Jet'),
        ('ultra_long',    'Ultra Long Range'),
        ('vip_airliner',  'VIP Airliner'),
    ]
    reference                    = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    owner                        = models.ForeignKey(settings.AUTH_USER_MODEL,
                                                      on_delete=models.CASCADE,
                                                      related_name='owned_aircraft',
                                                      limit_choices_to={'role': 'owner'})
    name                         = models.CharField(max_length=200)
    model                        = models.CharField(max_length=200)
    category                     = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    registration_number          = models.CharField(max_length=50, unique=True)
    base_location                = models.CharField(max_length=200)
    passenger_capacity           = models.IntegerField()
    range_km                     = models.IntegerField()
    cruise_speed_kmh             = models.IntegerField(null=True, blank=True)
    hourly_rate_usd              = models.DecimalField(max_digits=10, decimal_places=2)
    status                       = models.CharField(max_length=15, choices=STATUS_CHOICES,
                                                     default='pending')
    is_approved                  = models.BooleanField(default=False,
                                                        help_text="Admin must approve listing")
    exclusive_tiers              = models.ManyToManyField(MembershipTier, blank=True,
                                                           help_text="Leave empty = all tiers")
    # Tracking
    total_flight_hours           = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    maintenance_interval_hours   = models.IntegerField(default=100)
    last_maintenance_hours       = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    # Documents / compliance
    insurance_expiry             = models.DateField(null=True, blank=True)
    airworthiness_expiry         = models.DateField(null=True, blank=True)
    # Presentation
    description                  = models.TextField(blank=True)
    amenities                    = models.JSONField(default=list)
    image_url                    = models.URLField(blank=True)
    created_at                   = models.DateTimeField(auto_now_add=True)
    updated_at                   = models.DateTimeField(auto_now=True)

    @property
    def hours_until_maintenance(self):
        return self.maintenance_interval_hours - (
            self.total_flight_hours - self.last_maintenance_hours
        )

    @property
    def maintenance_due(self):
        return self.hours_until_maintenance <= 0

    def __str__(self):
        return f"{self.name} ({self.registration_number}) – {self.owner.username}"


# ─────────────────────────────────────────────────────────────────────────────
# MAINTENANCE LOG
# ─────────────────────────────────────────────────────────────────────────────
class MaintenanceLog(models.Model):
    TYPE_CHOICES = [
        ('routine',    'Routine Service'),
        ('repair',     'Repair'),
        ('inspection', 'Inspection'),
        ('upgrade',    'Upgrade'),
        ('emergency',  'Emergency'),
    ]
    STATUS_CHOICES = [
        ('scheduled',   'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ]
    aircraft          = models.ForeignKey(MarketplaceAircraft, on_delete=models.CASCADE,
                                           related_name='maintenance_logs')
    maintenance_type  = models.CharField(max_length=15, choices=TYPE_CHOICES)
    status            = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date    = models.DateField()
    completed_date    = models.DateField(null=True, blank=True)
    flight_hours_at   = models.DecimalField(max_digits=10, decimal_places=1,
                                             help_text="Aircraft hours at time of maintenance")
    description       = models.TextField()
    technician        = models.CharField(max_length=200, blank=True)
    cost_usd          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes             = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.aircraft.name} – {self.maintenance_type} on {self.scheduled_date}"


# ─────────────────────────────────────────────────────────────────────────────
# MARKETPLACE BOOKING
# ─────────────────────────────────────────────────────────────────────────────
class MarketplaceBooking(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending Payment'),
        ('confirmed',  'Confirmed'),
        ('in_flight',  'In Flight'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
        ('disputed',   'Disputed'),
    ]
    TRIP_CHOICES = [
        ('one_way',    'One Way'),
        ('round_trip', 'Round Trip'),
    ]
    reference          = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    client             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                            related_name='bookings',
                                            limit_choices_to={'role': 'client'})
    aircraft           = models.ForeignKey(MarketplaceAircraft, on_delete=models.PROTECT,
                                            related_name='bookings')
    membership         = models.ForeignKey(Membership, on_delete=models.SET_NULL,
                                            null=True, blank=True,
                                            help_text="Membership at time of booking")
    trip_type          = models.CharField(max_length=12, choices=TRIP_CHOICES, default='one_way')
    origin             = models.CharField(max_length=200)
    destination        = models.CharField(max_length=200)
    departure_datetime = models.DateTimeField()
    return_datetime    = models.DateTimeField(null=True, blank=True)
    estimated_hours    = models.DecimalField(max_digits=6, decimal_places=1)
    passenger_count    = models.IntegerField()
    status             = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    special_requests   = models.TextField(blank=True)
    # Pricing
    gross_amount_usd   = models.DecimalField(max_digits=12, decimal_places=2)
    commission_pct     = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    commission_usd     = models.DecimalField(max_digits=12, decimal_places=2)
    net_owner_usd      = models.DecimalField(max_digits=12, decimal_places=2)
    discount_applied   = models.DecimalField(max_digits=5, decimal_places=2, default=0,
                                              help_text="Membership discount %")
    # Stripe
    stripe_payment_id  = models.CharField(max_length=200, blank=True)
    payment_status     = models.CharField(max_length=20, default='unpaid')
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate commission and net
        self.commission_usd = round(self.gross_amount_usd * self.commission_pct / 100, 2)
        self.net_owner_usd  = round(self.gross_amount_usd - self.commission_usd, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {str(self.reference)[:8]} | {self.client.username} | {self.origin}→{self.destination}"


# ─────────────────────────────────────────────────────────────────────────────
# COMMISSION SETTING  (admin-controlled global rate)
# ─────────────────────────────────────────────────────────────────────────────
class CommissionSetting(models.Model):
    rate_pct      = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    effective_from = models.DateField(default=timezone.now)
    notes         = models.TextField(blank=True)
    set_by        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                       null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.rate_pct}% from {self.effective_from}"


# ─────────────────────────────────────────────────────────────────────────────
# PAYMENT RECORD
# ─────────────────────────────────────────────────────────────────────────────
class PaymentRecord(models.Model):
    TYPE_CHOICES = [
        ('membership', 'Membership Fee'),
        ('booking',    'Flight Booking'),
        ('refund',     'Refund'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed',    'Failed'),
        ('refunded',  'Refunded'),
    ]
    reference         = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user              = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                           related_name='payments')
    payment_type      = models.CharField(max_length=12, choices=TYPE_CHOICES)
    booking           = models.ForeignKey(MarketplaceBooking, on_delete=models.SET_NULL,
                                           null=True, blank=True, related_name='payment_records')
    membership        = models.ForeignKey(Membership, on_delete=models.SET_NULL,
                                           null=True, blank=True, related_name='payment_records')
    amount_usd        = models.DecimalField(max_digits=12, decimal_places=2)
    currency          = models.CharField(max_length=3, default='USD')
    status            = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    stripe_payment_id = models.CharField(max_length=200, blank=True)
    stripe_receipt_url = models.URLField(blank=True)
    description       = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_type} – ${self.amount_usd} – {self.status}"


# ─────────────────────────────────────────────────────────────────────────────
# SAVED ROUTE
# ─────────────────────────────────────────────────────────────────────────────
class SavedRoute(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                     related_name='saved_routes')
    name        = models.CharField(max_length=200, help_text="e.g. 'NYC to London'")
    origin      = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    notes       = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} | {self.origin} → {self.destination}"


# ─────────────────────────────────────────────────────────────────────────────
# DISPUTE
# ─────────────────────────────────────────────────────────────────────────────
class Dispute(models.Model):
    STATUS_CHOICES = [
        ('open',     'Open'),
        ('reviewing','Under Review'),
        ('resolved', 'Resolved'),
        ('closed',   'Closed'),
    ]
    reference   = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    booking     = models.ForeignKey(MarketplaceBooking, on_delete=models.CASCADE,
                                     related_name='disputes')
    raised_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject     = models.CharField(max_length=300)
    description = models.TextField()
    status      = models.CharField(max_length=12, choices=STATUS_CHOICES, default='open')
    resolution  = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dispute {str(self.reference)[:8]} – {self.subject[:40]}"