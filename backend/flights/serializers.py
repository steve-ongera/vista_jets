from rest_framework import serializers
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg, YachtCharter,
    LeaseInquiry, FlightInquiry , ContactInquiry , GroupCharterInquiry , AirCargoInquiry , AircraftSalesInquiry
)


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'


class AircraftSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Aircraft
        fields = '__all__'


class YachtSerializer(serializers.ModelSerializer):
    size_display = serializers.CharField(source='get_size_category_display', read_only=True)

    class Meta:
        model = Yacht
        fields = '__all__'


class FlightLegSerializer(serializers.ModelSerializer):
    origin_detail = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)

    class Meta:
        model = FlightLeg
        fields = '__all__'


class FlightBookingSerializer(serializers.ModelSerializer):
    legs = FlightLegSerializer(many=True, read_only=True)
    origin_detail = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)
    aircraft_detail = AircraftSerializer(source='aircraft', read_only=True)
    reference = serializers.UUIDField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = FlightBooking
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'quoted_price_usd', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('trip_type') == 'round_trip' and not data.get('return_date'):
            raise serializers.ValidationError({'return_date': 'Return date required for round trips.'})
        if data.get('return_date') and data.get('departure_date'):
            if data['return_date'] < data['departure_date']:
                raise serializers.ValidationError({'return_date': 'Return date must be after departure date.'})
        return data


class FlightBookingCreateSerializer(serializers.ModelSerializer):
    """Used for creating bookings - simpler input"""
    legs_data = FlightLegSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = FlightBooking
        exclude = ['reference', 'status', 'quoted_price_usd', 'created_at', 'updated_at']

    def create(self, validated_data):
        legs_data = validated_data.pop('legs_data', [])
        booking = FlightBooking.objects.create(**validated_data)
        for i, leg in enumerate(legs_data, 1):
            FlightLeg.objects.create(booking=booking, leg_number=i, **leg)
        return booking


class YachtCharterSerializer(serializers.ModelSerializer):
    yacht_detail = YachtSerializer(source='yacht', read_only=True)
    reference = serializers.UUIDField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = YachtCharter
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'quoted_price_usd', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('charter_end') and data.get('charter_start'):
            if data['charter_end'] <= data['charter_start']:
                raise serializers.ValidationError({'charter_end': 'End date must be after start date.'})
        return data


class LeaseInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)
    aircraft_detail = AircraftSerializer(source='aircraft', read_only=True)
    yacht_detail = YachtSerializer(source='yacht', read_only=True)

    class Meta:
        model = LeaseInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']

    def validate(self, data):
        asset_type = data.get('asset_type')
        if asset_type == 'aircraft' and not data.get('aircraft'):
            # Aircraft optional — can be suggested by team
            pass
        if asset_type == 'yacht' and not data.get('yacht'):
            pass
        return data


class FlightInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)

    class Meta:
        model = FlightInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class BookingStatusSerializer(serializers.Serializer):
    """Used for tracking bookings by reference"""
    reference = serializers.UUIDField()
    
    

# ── ADD THESE IMPORTS to the top of serializers.py ───────────────────────────
# from .models import (...existing..., ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry)


class ContactInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)

    class Meta:
        model = ContactInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class GroupCharterInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)
    group_type_display = serializers.CharField(source='get_group_type_display', read_only=True)

    class Meta:
        model = GroupCharterInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']

    def validate(self, data):
        if data.get('is_round_trip') and not data.get('return_date'):
            raise serializers.ValidationError({'return_date': 'Return date required for round trip.'})
        if data.get('return_date') and data.get('departure_date'):
            if data['return_date'] < data['departure_date']:
                raise serializers.ValidationError({'return_date': 'Return date must be after departure date.'})
        return data


class AirCargoInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)
    cargo_type_display = serializers.CharField(source='get_cargo_type_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model = AirCargoInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class AircraftSalesInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)
    inquiry_type_display = serializers.CharField(source='get_inquiry_type_display', read_only=True)
    budget_range_display = serializers.CharField(source='get_budget_range_display', read_only=True)

    class Meta:
        model = AircraftSalesInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']
        
        
        
        
        
        
# ── MEMBERSHIP SYSTEM: ADD TO serializers.py ──────────────────────────────────
# Add to top: from rest_framework_simplejwt.tokens import RefreshToken
# pip install djangorestframework-simplejwt

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog,
    MarketplaceBooking, CommissionSetting,
    PaymentRecord, SavedRoute, Dispute,
)


# ── AUTH ──────────────────────────────────────────────────────────────────────
class UserRegistrationSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'company', 'role', 'password', 'password2']
        extra_kwargs = {'role': {'required': False}}

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account disabled.')
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    membership_status = serializers.SerializerMethodField()
    membership_tier   = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'company', 'role', 'avatar_url', 'created_at',
                  'membership_status', 'membership_tier']
        read_only_fields = ['id', 'username', 'role', 'created_at']

    def get_membership_status(self, obj):
        try:
            return obj.membership.status
        except Exception:
            return None

    def get_membership_tier(self, obj):
        try:
            return obj.membership.tier.display_name
        except Exception:
            return None


# ── MEMBERSHIP TIER ───────────────────────────────────────────────────────────
class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MembershipTier
        fields = '__all__'


# ── MEMBERSHIP ────────────────────────────────────────────────────────────────
class MembershipSerializer(serializers.ModelSerializer):
    tier_detail    = MembershipTierSerializer(source='tier', read_only=True)
    tier_name      = serializers.CharField(source='tier.display_name', read_only=True)
    days_remaining = serializers.ReadOnlyField()
    is_active      = serializers.ReadOnlyField()
    user_name      = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email     = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = Membership
        fields = '__all__'
        read_only_fields = ['reference', 'user', 'commission_usd', 'net_owner_usd', 'created_at', 'updated_at']


class MembershipCreateSerializer(serializers.Serializer):
    tier_name     = serializers.ChoiceField(choices=['basic', 'premium', 'corporate'])
    billing_cycle = serializers.ChoiceField(choices=['monthly', 'annual'])
    auto_renew    = serializers.BooleanField(default=True)


# ── MARKETPLACE AIRCRAFT ──────────────────────────────────────────────────────
class MarketplaceAircraftSerializer(serializers.ModelSerializer):
    owner_name              = serializers.CharField(source='owner.get_full_name', read_only=True)
    hours_until_maintenance = serializers.ReadOnlyField()
    maintenance_due         = serializers.ReadOnlyField()
    category_display        = serializers.CharField(source='get_category_display', read_only=True)
    status_display          = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = MarketplaceAircraft
        fields = '__all__'
        read_only_fields = ['reference', 'owner', 'is_approved', 'created_at', 'updated_at']


# ── MAINTENANCE LOG ───────────────────────────────────────────────────────────
class MaintenanceLogSerializer(serializers.ModelSerializer):
    aircraft_name = serializers.CharField(source='aircraft.name', read_only=True)
    type_display  = serializers.CharField(source='get_maintenance_type_display', read_only=True)

    class Meta:
        model  = MaintenanceLog
        fields = '__all__'
        read_only_fields = ['created_at']


# ── MARKETPLACE BOOKING ───────────────────────────────────────────────────────
class MarketplaceBookingSerializer(serializers.ModelSerializer):
    client_name    = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email   = serializers.EmailField(source='client.email', read_only=True)
    aircraft_name  = serializers.CharField(source='aircraft.name', read_only=True)
    aircraft_reg   = serializers.CharField(source='aircraft.registration_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tier_name      = serializers.SerializerMethodField()

    class Meta:
        model  = MarketplaceBooking
        fields = '__all__'
        read_only_fields = [
            'reference', 'client', 'membership',
            'commission_usd', 'net_owner_usd', 'created_at', 'updated_at'
        ]

    def get_tier_name(self, obj):
        return obj.membership.tier.display_name if obj.membership else None

    def validate(self, data):
        user = self.context['request'].user
        # Ensure membership is active before booking
        try:
            m = user.membership
            if not m.is_active:
                raise serializers.ValidationError('Your membership is not active.')
        except Membership.DoesNotExist:
            raise serializers.ValidationError('You need an active membership to book.')
        return data


class MarketplaceBookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MarketplaceBooking
        fields = [
            'aircraft', 'trip_type', 'origin', 'destination',
            'departure_datetime', 'return_datetime',
            'estimated_hours', 'passenger_count', 'special_requests',
        ]


# ── COMMISSION ────────────────────────────────────────────────────────────────
class CommissionSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CommissionSetting
        fields = '__all__'
        read_only_fields = ['set_by', 'created_at']


# ── PAYMENT ───────────────────────────────────────────────────────────────────
class PaymentRecordSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = PaymentRecord
        fields = '__all__'
        read_only_fields = ['reference', 'user', 'created_at']


# ── SAVED ROUTE ───────────────────────────────────────────────────────────────
class SavedRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SavedRoute
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


# ── DISPUTE ───────────────────────────────────────────────────────────────────
class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source='raised_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Dispute
        fields = '__all__'
        read_only_fields = ['reference', 'raised_by', 'created_at', 'resolved_at']


# ── DASHBOARD SERIALIZERS ─────────────────────────────────────────────────────
class ClientDashboardSerializer(serializers.Serializer):
    membership         = MembershipSerializer()
    upcoming_bookings  = MarketplaceBookingSerializer(many=True)
    total_flights      = serializers.IntegerField()
    total_spent_usd    = serializers.DecimalField(max_digits=12, decimal_places=2)
    renewal_alert      = serializers.BooleanField()
    days_remaining     = serializers.IntegerField(allow_null=True)


class OwnerDashboardSerializer(serializers.Serializer):
    total_revenue_usd      = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_revenue_usd    = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_flight_hours     = serializers.DecimalField(max_digits=10, decimal_places=1)
    upcoming_flights_count = serializers.IntegerField()
    maintenance_alerts     = MaintenanceLogSerializer(many=True)
    aircraft_count         = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    total_platform_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_commissions      = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_members          = serializers.IntegerField()
    total_aircraft         = serializers.IntegerField()
    pending_approvals      = serializers.IntegerField()
    open_disputes          = serializers.IntegerField()
    commission_rate        = serializers.DecimalField(max_digits=5, decimal_places=2)