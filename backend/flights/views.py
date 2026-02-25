from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, YachtCharter,
    LeaseInquiry, FlightInquiry
)
from .serializers import (
    AirportSerializer, AircraftSerializer, YachtSerializer,
    FlightBookingSerializer, FlightBookingCreateSerializer,
    YachtCharterSerializer, LeaseInquirySerializer,
    FlightInquirySerializer
)


class AirportViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only list of airports for autocomplete"""
    queryset = Airport.objects.all().order_by('city')
    serializer_class = AirportSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['code', 'name', 'city', 'country']


class AircraftViewSet(viewsets.ReadOnlyModelViewSet):
    """Public aircraft catalog"""
    queryset = Aircraft.objects.filter(is_available=True).order_by('category')
    serializer_class = AircraftSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'model', 'category']


class YachtViewSet(viewsets.ReadOnlyModelViewSet):
    """Public yacht catalog"""
    queryset = Yacht.objects.filter(is_available=True).order_by('size_category')
    serializer_class = YachtSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['size_category']


class FlightBookingViewSet(viewsets.ModelViewSet):
    """
    Flight booking — no auth required.
    Guests can create bookings and track by reference UUID.
    """
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['guest_email', 'guest_name']

    def get_queryset(self):
        return FlightBooking.objects.select_related(
            'origin', 'destination', 'aircraft'
        ).prefetch_related('legs').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return FlightBookingCreateSerializer
        return FlightBookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        # Return full detail after creation
        detail_serializer = FlightBookingSerializer(booking)
        return Response(
            {
                'message': 'Your flight request has been received. Our team will contact you shortly.',
                'booking': detail_serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='track/(?P<reference>[^/.]+)')
    def track(self, request, reference=None):
        """Track booking status by UUID reference — no auth needed"""
        try:
            booking = FlightBooking.objects.select_related(
                'origin', 'destination', 'aircraft'
            ).prefetch_related('legs').get(reference=reference)
            serializer = FlightBookingSerializer(booking)
            return Response(serializer.data)
        except FlightBooking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

    def list(self, request, *args, **kwargs):
        # Only allow listing if email param is provided (for guest to find their bookings)
        email = request.query_params.get('email')
        if not email:
            return Response(
                {'error': 'Please provide your email to retrieve bookings.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        qs = self.get_queryset().filter(guest_email__iexact=email)
        serializer = FlightBookingSerializer(qs, many=True)
        return Response(serializer.data)


class YachtCharterViewSet(viewsets.ModelViewSet):
    """Yacht charter bookings"""
    permission_classes = [AllowAny]

    def get_queryset(self):
        return YachtCharter.objects.select_related('yacht').order_by('-created_at')

    def get_serializer_class(self):
        return YachtCharterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        charter = serializer.save()
        return Response(
            {
                'message': 'Your yacht charter request has been received. Our concierge will be in touch.',
                'charter': YachtCharterSerializer(charter).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='track/(?P<reference>[^/.]+)')
    def track(self, request, reference=None):
        try:
            charter = YachtCharter.objects.select_related('yacht').get(reference=reference)
            serializer = YachtCharterSerializer(charter)
            return Response(serializer.data)
        except YachtCharter.DoesNotExist:
            return Response({'error': 'Charter not found.'}, status=status.HTTP_404_NOT_FOUND)

    def list(self, request, *args, **kwargs):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Please provide your email.'}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(guest_email__iexact=email)
        return Response(YachtCharterSerializer(qs, many=True).data)


class LeaseInquiryViewSet(viewsets.ModelViewSet):
    """Asset lease inquiries"""
    permission_classes = [AllowAny]
    serializer_class = LeaseInquirySerializer

    def get_queryset(self):
        return LeaseInquiry.objects.select_related('aircraft', 'yacht').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': 'Your lease inquiry has been submitted. Our leasing specialists will contact you.',
                'inquiry': LeaseInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )


class FlightInquiryViewSet(viewsets.ModelViewSet):
    """General open-ended flight inquiries"""
    permission_classes = [AllowAny]
    serializer_class = FlightInquirySerializer

    def get_queryset(self):
        return FlightInquiry.objects.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': 'Thank you for your inquiry. A flight specialist will reach out within 2 hours.',
                'inquiry': FlightInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )


class QuickQuoteView(APIView):
    """Rough price estimate based on route and aircraft"""
    permission_classes = [AllowAny]

    def post(self, request):
        origin_id = request.data.get('origin')
        destination_id = request.data.get('destination')
        aircraft_id = request.data.get('aircraft')

        if not all([origin_id, destination_id, aircraft_id]):
            return Response({'error': 'origin, destination and aircraft are required.'}, status=400)

        try:
            from .models import Airport, Aircraft
            import math
            origin = Airport.objects.get(id=origin_id)
            destination = Airport.objects.get(id=destination_id)
            aircraft = Aircraft.objects.get(id=aircraft_id)

            # Haversine distance estimate
            if origin.latitude and destination.latitude:
                lat1, lon1 = float(origin.latitude), float(origin.longitude)
                lat2, lon2 = float(destination.latitude), float(destination.longitude)
                R = 6371
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                distance_km = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                flight_hours = distance_km / float(aircraft.cruise_speed_kmh)
                estimated_price = float(aircraft.hourly_rate_usd) * flight_hours * 1.25  # 25% overhead
            else:
                estimated_price = None
                flight_hours = None

            return Response({
                'origin': AirportSerializer(origin).data,
                'destination': AirportSerializer(destination).data,
                'aircraft': AircraftSerializer(aircraft).data,
                'estimated_flight_hours': round(flight_hours, 1) if flight_hours else None,
                'estimated_price_usd': round(estimated_price, 0) if estimated_price else None,
                'note': 'Estimate only. Final pricing confirmed by our team.'
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        
# ── ADD THESE IMPORTS to views.py ─────────────────────────────────────────────
from .models import (ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry)
from .serializers import (ContactInquirySerializer, GroupCharterInquirySerializer, AirCargoInquirySerializer, AircraftSalesInquirySerializer)


class ContactInquiryViewSet(viewsets.ModelViewSet):
    """Contact form submissions"""
    permission_classes = [AllowAny]
    serializer_class = ContactInquirySerializer

    def get_queryset(self):
        return ContactInquiry.objects.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': "Thank you for reaching out. A member of our team will respond within 24 hours.",
                'inquiry': ContactInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )


class GroupCharterInquiryViewSet(viewsets.ModelViewSet):
    """Group charter inquiries"""
    permission_classes = [AllowAny]
    serializer_class = GroupCharterInquirySerializer

    def get_queryset(self):
        return GroupCharterInquiry.objects.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': 'Your group charter inquiry has been received. Our team will contact you with a tailored solution within 4 hours.',
                'inquiry': GroupCharterInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='track/(?P<reference>[^/.]+)')
    def track(self, request, reference=None):
        try:
            inquiry = GroupCharterInquiry.objects.get(reference=reference)
            return Response(GroupCharterInquirySerializer(inquiry).data)
        except GroupCharterInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)


class AirCargoInquiryViewSet(viewsets.ModelViewSet):
    """Air cargo inquiries"""
    permission_classes = [AllowAny]
    serializer_class = AirCargoInquirySerializer

    def get_queryset(self):
        return AirCargoInquiry.objects.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': 'Your air cargo inquiry has been submitted. A cargo specialist will respond within 2 hours.',
                'inquiry': AirCargoInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='track/(?P<reference>[^/.]+)')
    def track(self, request, reference=None):
        try:
            inquiry = AirCargoInquiry.objects.get(reference=reference)
            return Response(AirCargoInquirySerializer(inquiry).data)
        except AirCargoInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)


class AircraftSalesInquiryViewSet(viewsets.ModelViewSet):
    """Aircraft buy/sell/trade inquiries"""
    permission_classes = [AllowAny]
    serializer_class = AircraftSalesInquirySerializer

    def get_queryset(self):
        return AircraftSalesInquiry.objects.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        return Response(
            {
                'message': 'Your aircraft sales inquiry has been received. Our aviation sales team will be in touch within 24 hours.',
                'inquiry': AircraftSalesInquirySerializer(inquiry).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='track/(?P<reference>[^/.]+)')
    def track(self, request, reference=None):
        try:
            inquiry = AircraftSalesInquiry.objects.get(reference=reference)
            return Response(AircraftSalesInquirySerializer(inquiry).data)
        except AircraftSalesInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        
        
        
        



from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import (
    User, MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog,
    MarketplaceBooking, CommissionSetting,
    PaymentRecord, SavedRoute, Dispute,
)
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer,
    MembershipTierSerializer, MembershipSerializer, MembershipCreateSerializer,
    MarketplaceAircraftSerializer, MaintenanceLogSerializer,
    MarketplaceBookingSerializer, MarketplaceBookingCreateSerializer,
    CommissionSettingSerializer, PaymentRecordSerializer,
    SavedRouteSerializer, DisputeSerializer,
    ClientDashboardSerializer, OwnerDashboardSerializer, AdminDashboardSerializer,
)


# ── PERMISSIONS ───────────────────────────────────────────────────────────────
class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'admin']


# ── AUTH VIEWSET ──────────────────────────────────────────────────────────────
class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Registration successful.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access':  str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserProfileSerializer(request.user).data)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


# ── MEMBERSHIP TIER VIEWSET ───────────────────────────────────────────────────
class MembershipTierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = MembershipTier.objects.filter(is_active=True)
    serializer_class   = MembershipTierSerializer
    permission_classes = [permissions.AllowAny]


# ── MEMBERSHIP VIEWSET ────────────────────────────────────────────────────────
class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class   = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Membership.objects.select_related('user', 'tier').all()
        return Membership.objects.filter(user=user)

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Client subscribes to a membership tier."""
        serializer = MembershipCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            tier = MembershipTier.objects.get(name=serializer.validated_data['tier_name'])
        except MembershipTier.DoesNotExist:
            return Response({'error': 'Tier not found.'}, status=404)

        billing  = serializer.validated_data['billing_cycle']
        amount   = tier.annual_fee_usd if billing == 'annual' else tier.monthly_fee_usd
        today    = timezone.now().date()
        end_date = today + timedelta(days=365 if billing == 'annual' else 30)

        membership, created = Membership.objects.update_or_create(
            user=request.user,
            defaults={
                'tier':          tier,
                'status':        'active',
                'billing_cycle': billing,
                'start_date':    today,
                'end_date':      end_date,
                'auto_renew':    serializer.validated_data['auto_renew'],
                'amount_paid':   amount,
            }
        )
        # Record payment
        PaymentRecord.objects.create(
            user=request.user, payment_type='membership',
            membership=membership, amount_usd=amount, status='succeeded',
            description=f"{tier.display_name} – {billing} subscription"
        )
        return Response({
            'message': f'Successfully subscribed to {tier.display_name}.',
            'membership': MembershipSerializer(membership).data,
        }, status=201 if created else 200)

    @action(detail=False, methods=['get'])
    def my_membership(self, request):
        try:
            m = request.user.membership
            return Response(MembershipSerializer(m).data)
        except Membership.DoesNotExist:
            return Response({'membership': None, 'message': 'No membership found.'})


# ── MARKETPLACE AIRCRAFT VIEWSET ──────────────────────────────────────────────
class MarketplaceAircraftViewSet(viewsets.ModelViewSet):
    serializer_class = MarketplaceAircraftSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action in ['approve', 'set_commission']:
            return [IsAdminUser()]
        return [IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return MarketplaceAircraft.objects.filter(owner=user)
        if user.role == 'admin':
            return MarketplaceAircraft.objects.all()
        # Clients only see approved & available
        return MarketplaceAircraft.objects.filter(
            is_approved=True, status='available'
        ).exclude(
            exclusive_tiers__isnull=False
        ) | MarketplaceAircraft.objects.filter(
            is_approved=True, status='available',
            exclusive_tiers__membership__user=user
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        aircraft = self.get_object()
        aircraft.is_approved = True
        aircraft.status = 'available'
        aircraft.save()
        return Response({'message': f'{aircraft.name} approved and listed.'})

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        aircraft = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in MarketplaceAircraft.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status.'}, status=400)
        aircraft.status = new_status
        aircraft.save()
        return Response({'message': f'Status updated to {new_status}.'})

    @action(detail=True, methods=['post'])
    def log_flight_hours(self, request, pk=None):
        aircraft = self.get_object()
        hours = Decimal(str(request.data.get('hours', 0)))
        aircraft.total_flight_hours += hours
        aircraft.save()
        alert = aircraft.maintenance_due
        return Response({
            'total_flight_hours':     float(aircraft.total_flight_hours),
            'hours_until_maintenance': float(aircraft.hours_until_maintenance),
            'maintenance_due':         alert,
            'alert_message':          '⚠️ Maintenance required!' if alert else None,
        })


# ── MAINTENANCE LOG VIEWSET ───────────────────────────────────────────────────
class MaintenanceLogViewSet(viewsets.ModelViewSet):
    serializer_class   = MaintenanceLogSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return MaintenanceLog.objects.select_related('aircraft').all()
        return MaintenanceLog.objects.filter(aircraft__owner=user)

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Return all aircraft where maintenance is due."""
        user = self.request.user
        qs = MarketplaceAircraft.objects.filter(owner=user) if user.role == 'owner' \
             else MarketplaceAircraft.objects.all()
        due = [a for a in qs if a.maintenance_due]
        return Response(MarketplaceAircraftSerializer(due, many=True).data)


# ── MARKETPLACE BOOKING VIEWSET ───────────────────────────────────────────────
class MarketplaceBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MarketplaceBookingCreateSerializer
        return MarketplaceBookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return MarketplaceBooking.objects.filter(client=user).select_related('aircraft', 'membership')
        if user.role == 'owner':
            return MarketplaceBooking.objects.filter(aircraft__owner=user)
        return MarketplaceBooking.objects.all()

    def perform_create(self, serializer):
        user     = self.request.user
        aircraft = serializer.validated_data['aircraft']
        hours    = serializer.validated_data['estimated_hours']

        # Get active membership & discount
        try:
            membership = user.membership
            discount   = membership.tier.hourly_discount_pct if membership.is_active else Decimal('0')
        except Membership.DoesNotExist:
            raise Exception('Active membership required to book.')

        # Get commission rate
        setting = CommissionSetting.objects.order_by('-effective_from').first()
        commission_pct = setting.rate_pct if setting else Decimal('10')

        # Calculate price
        base_rate   = aircraft.hourly_rate_usd
        discounted  = base_rate * (1 - discount / 100)
        gross       = round(discounted * hours, 2)

        serializer.save(
            client=user,
            membership=membership,
            gross_amount_usd=gross,
            commission_pct=commission_pct,
            discount_applied=discount,
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ['completed', 'in_flight']:
            return Response({'error': 'Cannot cancel this booking.'}, status=400)
        booking.status = 'cancelled'
        booking.save()
        return Response({'message': 'Booking cancelled.'})

    @action(detail=False, methods=['get'])
    def track(self, request):
        ref = request.query_params.get('reference')
        try:
            booking = MarketplaceBooking.objects.get(reference=ref)
            return Response(MarketplaceBookingSerializer(booking).data)
        except MarketplaceBooking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)


# ── COMMISSION VIEWSET ────────────────────────────────────────────────────────
class CommissionSettingViewSet(viewsets.ModelViewSet):
    queryset           = CommissionSetting.objects.all()
    serializer_class   = CommissionSettingSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(set_by=self.request.user)


# ── PAYMENT VIEWSET ───────────────────────────────────────────────────────────
class PaymentRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PaymentRecord.objects.all()
        return PaymentRecord.objects.filter(user=user)


# ── SAVED ROUTE VIEWSET ───────────────────────────────────────────────────────
class SavedRouteViewSet(viewsets.ModelViewSet):
    serializer_class   = SavedRouteSerializer
    permission_classes = [IsClient]

    def get_queryset(self):
        return SavedRoute.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── DISPUTE VIEWSET ───────────────────────────────────────────────────────────
class DisputeViewSet(viewsets.ModelViewSet):
    serializer_class   = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Dispute.objects.all()
        return Dispute.objects.filter(raised_by=user)

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def resolve(self, request, pk=None):
        dispute = self.get_object()
        dispute.status      = 'resolved'
        dispute.resolution  = request.data.get('resolution', '')
        dispute.resolved_at = timezone.now()
        dispute.save()
        return Response({'message': 'Dispute resolved.'})


# ── DASHBOARD VIEWSETS ────────────────────────────────────────────────────────
class ClientDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsClient]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        try:
            membership = user.membership
        except Membership.DoesNotExist:
            membership = None

        bookings    = MarketplaceBooking.objects.filter(client=user)
        upcoming    = bookings.filter(departure_datetime__gte=timezone.now(),
                                      status__in=['confirmed', 'pending'])
        total_spent = bookings.filter(status='completed').aggregate(
            t=Sum('gross_amount_usd'))['t'] or 0
        days_rem    = membership.days_remaining if membership else None

        return Response({
            'membership':        MembershipSerializer(membership).data if membership else None,
            'upcoming_bookings': MarketplaceBookingSerializer(upcoming[:5], many=True).data,
            'total_flights':     bookings.filter(status='completed').count(),
            'total_spent_usd':   total_spent,
            'renewal_alert':     (days_rem is not None and days_rem <= 30),
            'days_remaining':    days_rem,
        })


class OwnerDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsOwner]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user     = request.user
        aircraft = MarketplaceAircraft.objects.filter(owner=user)
        bookings = MarketplaceBooking.objects.filter(aircraft__owner=user)

        now          = timezone.now()
        month_start  = now.replace(day=1, hour=0, minute=0, second=0)

        total_rev   = bookings.filter(status='completed').aggregate(
            t=Sum('net_owner_usd'))['t'] or 0
        monthly_rev = bookings.filter(status='completed',
                                       created_at__gte=month_start).aggregate(
            t=Sum('net_owner_usd'))['t'] or 0
        total_hours = aircraft.aggregate(t=Sum('total_flight_hours'))['t'] or 0
        upcoming    = bookings.filter(departure_datetime__gte=now,
                                      status='confirmed').count()
        maint_alerts= MaintenanceLog.objects.filter(
            aircraft__owner=user, status='scheduled',
            scheduled_date__lte=now.date() + timedelta(days=7)
        )

        return Response({
            'total_revenue_usd':      total_rev,
            'monthly_revenue_usd':    monthly_rev,
            'total_flight_hours':     float(total_hours),
            'upcoming_flights_count': upcoming,
            'maintenance_alerts':     MaintenanceLogSerializer(maint_alerts, many=True).data,
            'aircraft_count':         aircraft.count(),
        })


class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        bookings   = MarketplaceBooking.objects.filter(status='completed')
        commission = CommissionSetting.objects.order_by('-effective_from').first()

        return Response({
            'total_platform_revenue': bookings.aggregate(t=Sum('gross_amount_usd'))['t'] or 0,
            'total_commissions':      bookings.aggregate(t=Sum('commission_usd'))['t'] or 0,
            'total_members':          Membership.objects.filter(status='active').count(),
            'total_aircraft':         MarketplaceAircraft.objects.filter(is_approved=True).count(),
            'pending_approvals':      MarketplaceAircraft.objects.filter(is_approved=False).count(),
            'open_disputes':          Dispute.objects.filter(status='open').count(),
            'commission_rate':        commission.rate_pct if commission else 10,
        })
        
        
        

# ── ADD TO / APPEND TO views.py ──────────────────────────────────────────────
# New admin viewsets. Add these imports at the top of views.py:

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings as django_settings
from .models import EmailLog
from .serializers import (
      SendEmailSerializer, FlightBookingAdminSerializer,
      FlightBookingPriceSerializer, FlightBookingCreateAdminSerializer,
      YachtCharterAdminSerializer, YachtCharterPriceSerializer,
      LeaseInquiryAdminSerializer, ContactInquiryAdminSerializer,
      GroupCharterInquiryAdminSerializer, AirCargoInquiryAdminSerializer,
      AircraftSalesInquiryAdminSerializer, PriceCalculatorSerializer,
      MarketplaceBookingAdminSerializer, MarketplaceBookingCreateAdminSerializer,
      UserAdminSerializer, InquiryReplySerializer, EmailLogSerializer,
  )
# ─────────────────────────────────────────────────────────────────────────────

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings as django_settings
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from .models import (
    User, Membership, MembershipTier,
    MarketplaceAircraft, MarketplaceBooking, CommissionSetting,
    MaintenanceLog, PaymentRecord, Dispute, SavedRoute,
    FlightBooking, YachtCharter, LeaseInquiry, FlightInquiry,
    ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    Aircraft, Yacht, Airport, EmailLog,
)


# ── SHARED HELPERS ────────────────────────────────────────────────────────────
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


def _send_email_and_log(admin_user, to_email, to_name, subject, body,
                        inquiry_type='general', related_id=None):
    """Send HTML email and log result. Returns (success: bool, error: str)"""
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
      <div style="background:#0b1d3a;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="color:#C9A84C;margin:0">NairobiJetHouse</h2>
        <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">Private Aviation & Luxury Charter</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
        {"<p style='color:#374151'>Dear " + to_name + ",</p>" if to_name else ""}
        <div style="color:#374151;line-height:1.7;white-space:pre-line">{body}</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;margin:0">
          NairobiJetHouse · Private Aviation & Luxury Charter<br>
          This email was sent by our operations team. Please do not reply directly to this message.
        </p>
      </div>
    </body></html>
    """
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'ops@NairobiJetHouse.com'),
            to=[f'"{to_name}" <{to_email}>' if to_name else to_email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()
        EmailLog.objects.create(
            sent_by=admin_user, to_email=to_email, to_name=to_name,
            subject=subject, body=body, inquiry_type=inquiry_type,
            related_id=related_id, success=True,
        )
        return True, ''
    except Exception as e:
        EmailLog.objects.create(
            sent_by=admin_user, to_email=to_email, to_name=to_name,
            subject=subject, body=body, inquiry_type=inquiry_type,
            related_id=related_id, success=False, error_msg=str(e),
        )
        return False, str(e)


# ── EMAIL LOG VIEWSET ─────────────────────────────────────────────────────────
class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['to_email', 'subject', 'inquiry_type']

    def get_queryset(self):
        return EmailLog.objects.select_related('sent_by').all()

    def get_serializer_class(self):
        from .serializers import EmailLogSerializer
        return EmailLogSerializer

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Generic send-email endpoint for admin"""
        from .serializers import SendEmailSerializer
        ser = SendEmailSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        ok, err = _send_email_and_log(
            request.user, d['to_email'], d.get('to_name', ''),
            d['subject'], d['body'], d.get('inquiry_type', 'general'),
            d.get('related_id'),
        )
        if ok:
            return Response({'message': f'Email sent to {d["to_email"]} successfully.'})
        return Response({'error': f'Failed to send email: {err}'}, status=500)


# ── PRICE CALCULATOR VIEW ─────────────────────────────────────────────────────
class PriceCalculatorViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        from .serializers import PriceCalculatorSerializer
        ser = PriceCalculatorSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)

        d = ser.validated_data
        commission = CommissionSetting.objects.order_by('-effective_from').first()
        commission_pct = d.get('commission_pct') or (commission.rate_pct if commission else Decimal('10'))

        # Base rate
        hourly_rate = d.get('hourly_rate_usd')
        if not hourly_rate and d.get('aircraft_id'):
            try:
                aircraft = Aircraft.objects.get(id=d['aircraft_id'])
                hourly_rate = aircraft.hourly_rate_usd
            except Aircraft.DoesNotExist:
                pass
        if not hourly_rate:
            return Response({'error': 'Provide either aircraft_id or hourly_rate_usd.'}, status=400)

        hours      = Decimal(str(d['estimated_hours']))
        base       = hourly_rate * hours
        catering   = Decimal('500') * d['passenger_count'] if d.get('catering') else Decimal('0')
        ground     = Decimal('800') if d.get('ground_transport') else Decimal('0')
        concierge  = Decimal('400') if d.get('concierge') else Decimal('0')
        subtotal   = base + catering + ground + concierge
        discount   = (subtotal * Decimal(str(d['discount_pct'])) / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
        after_disc = subtotal - discount
        comm_amt   = (after_disc * Decimal(str(commission_pct)) / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
        owner_net  = after_disc - comm_amt

        return Response({
            'breakdown': {
                'hourly_rate_usd':    float(hourly_rate),
                'estimated_hours':    float(hours),
                'base_flight_cost':   float(base),
                'catering_cost':      float(catering),
                'ground_transport':   float(ground),
                'concierge_cost':     float(concierge),
                'subtotal':           float(subtotal),
                'discount_pct':       float(d['discount_pct']),
                'discount_amount':    float(discount),
                'total_after_discount': float(after_disc),
                'commission_pct':     float(commission_pct),
                'commission_amount':  float(comm_amt),
                'owner_net_usd':      float(owner_net),
                'grand_total_usd':    float(after_disc),
            }
        })


# ── FLIGHT BOOKING ADMIN VIEWSET ──────────────────────────────────────────────
class FlightBookingAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['guest_name', 'guest_email', 'reference']

    def get_queryset(self):
        return FlightBooking.objects.select_related('origin', 'destination', 'aircraft').order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import FlightBookingAdminSerializer, FlightBookingCreateAdminSerializer
        if self.action == 'create':
            return FlightBookingCreateAdminSerializer
        return FlightBookingAdminSerializer

    @action(detail=True, methods=['post'])
    def set_price(self, request, pk=None):
        """Admin sets quoted price, updates status, sends confirmation email"""
        from .serializers import FlightBookingPriceSerializer
        booking = self.get_object()
        ser = FlightBookingPriceSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data

        booking.quoted_price_usd = d['quoted_price_usd']
        if d.get('status'):
            booking.status = d['status']
        booking.save()

        result = {'message': 'Price updated.', 'email_sent': False}

        if d.get('send_email', True):
            route = f"{booking.origin.code} → {booking.destination.code}"
            body  = d.get('email_message') or (
                f"Dear {booking.guest_name},\n\n"
                f"Thank you for your flight enquiry with NairobiJetHouse.\n\n"
                f"We are pleased to provide your quote for the following flight:\n\n"
                f"Route:       {route}\n"
                f"Date:        {booking.departure_date}\n"
                f"Passengers:  {booking.passenger_count}\n"
                f"Trip Type:   {booking.get_trip_type_display()}\n\n"
                f"Quoted Price: USD ${d['quoted_price_usd']:,.2f}\n\n"
                f"To confirm your booking, please reply to this email or contact your dedicated concierge.\n\n"
                f"Warm regards,\nNairobiJetHouse Operations Team"
            )
            ok, err = _send_email_and_log(
                request.user, booking.guest_email, booking.guest_name,
                f"Your Flight Quote – {route} | NairobiJetHouse",
                body, 'flight_booking', booking.id,
            )
            result['email_sent'] = ok
            if not ok:
                result['email_error'] = err

        return Response(result)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Send a custom email reply to the guest"""
        from .serializers import InquiryReplySerializer
        booking = self.get_object()
        ser = InquiryReplySerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        if d.get('new_status'):
            booking.status = d['new_status']
        if d.get('quoted_price'):
            booking.quoted_price_usd = d['quoted_price']
        booking.save()
        ok, err = _send_email_and_log(
            request.user, booking.guest_email, booking.guest_name,
            d['subject'], d['message'], 'flight_booking', booking.id,
        )
        if ok:
            return Response({'message': 'Reply sent successfully.'})
        return Response({'error': err}, status=500)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in FlightBooking.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status.'}, status=400)
        booking.status = new_status
        booking.save()
        return Response({'message': f'Status updated to {new_status}.'})


# ── YACHT CHARTER ADMIN VIEWSET ───────────────────────────────────────────────
class YachtCharterAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['guest_name', 'guest_email', 'reference']

    def get_queryset(self):
        return YachtCharter.objects.select_related('yacht').order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import YachtCharterAdminSerializer
        return YachtCharterAdminSerializer

    @action(detail=True, methods=['post'])
    def set_price(self, request, pk=None):
        from .serializers import YachtCharterPriceSerializer
        charter = self.get_object()
        ser = YachtCharterPriceSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        charter.quoted_price_usd = d['quoted_price_usd']
        if d.get('status'):
            charter.status = d['status']
        charter.save()

        result = {'message': 'Price updated.', 'email_sent': False}
        if d.get('send_email', True):
            nights = (charter.charter_end - charter.charter_start).days
            body   = d.get('email_message') or (
                f"Dear {charter.guest_name},\n\n"
                f"Thank you for your yacht charter enquiry with NairobiJetHouse.\n\n"
                f"Yacht:        {charter.yacht.name if charter.yacht else 'TBC'}\n"
                f"Departure:    {charter.departure_port}\n"
                f"Charter Start: {charter.charter_start}\n"
                f"Charter End:  {charter.charter_end}\n"
                f"Duration:     {nights} night(s)\n"
                f"Guests:       {charter.guest_count}\n\n"
                f"Quoted Price: USD ${d['quoted_price_usd']:,.2f}\n\n"
                f"Please contact us to proceed with your booking confirmation.\n\n"
                f"Warm regards,\nNairobiJetHouse Concierge Team"
            )
            ok, err = _send_email_and_log(
                request.user, charter.guest_email, charter.guest_name,
                f"Your Yacht Charter Quote | NairobiJetHouse",
                body, 'yacht_charter', charter.id,
            )
            result['email_sent'] = ok
            if not ok:
                result['email_error'] = err
        return Response(result)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        from .serializers import InquiryReplySerializer
        charter = self.get_object()
        ser = InquiryReplySerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        if d.get('new_status'):
            charter.status = d['new_status']
        if d.get('quoted_price'):
            charter.quoted_price_usd = d['quoted_price']
        charter.save()
        ok, err = _send_email_and_log(
            request.user, charter.guest_email, charter.guest_name,
            d['subject'], d['message'], 'yacht_charter', charter.id,
        )
        if ok:
            return Response({'message': 'Reply sent successfully.'})
        return Response({'error': err}, status=500)


# ── GENERIC INQUIRY REPLY MIXIN ───────────────────────────────────────────────
class InquiryAdminMixin:
    """Mixin for inquiry viewsets that support reply + status update"""
    inquiry_type_label = 'general'

    def _get_email_fields(self, obj):
        """Returns (email, name) from inquiry object"""
        for email_field in ['email', 'guest_email']:
            email = getattr(obj, email_field, None)
            if email:
                break
        for name_field in ['full_name', 'guest_name', 'contact_name']:
            name = getattr(obj, name_field, None)
            if name:
                break
        return email or '', name or ''

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        from .serializers import InquiryReplySerializer
        obj = self.get_object()
        ser = InquiryReplySerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        if d.get('new_status') and hasattr(obj, 'status'):
            obj.status = d['new_status']
            obj.save()
        email, name = self._get_email_fields(obj)
        if not email:
            return Response({'error': 'No email address found on this record.'}, status=400)
        ok, err = _send_email_and_log(
            request.user, email, name,
            d['subject'], d['message'], self.inquiry_type_label, obj.id,
        )
        if ok:
            return Response({'message': f'Reply sent to {email}.'})
        return Response({'error': err}, status=500)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        obj = self.get_object()
        new_status = request.data.get('status')
        if not hasattr(obj, 'status'):
            return Response({'error': 'This record has no status field.'}, status=400)
        obj.status = new_status
        obj.save()
        return Response({'message': f'Status updated to {new_status}.'})


# ── LEASE INQUIRY ADMIN VIEWSET ───────────────────────────────────────────────
class LeaseInquiryAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes    = [IsAdminUser]
    inquiry_type_label    = 'lease_inquiry'
    filter_backends       = [filters.SearchFilter]
    search_fields         = ['guest_name', 'guest_email', 'reference']

    def get_queryset(self):
        return LeaseInquiry.objects.select_related('aircraft', 'yacht').order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import LeaseInquiryAdminSerializer
        return LeaseInquiryAdminSerializer


# ── CONTACT INQUIRY ADMIN VIEWSET ─────────────────────────────────────────────
class ContactInquiryAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    inquiry_type_label = 'contact'
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['full_name', 'email', 'subject', 'reference']

    def get_queryset(self):
        return ContactInquiry.objects.order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import ContactInquiryAdminSerializer
        return ContactInquiryAdminSerializer


# ── GROUP CHARTER ADMIN VIEWSET ───────────────────────────────────────────────
class GroupCharterAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    inquiry_type_label = 'group_charter'
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['contact_name', 'email', 'reference']

    def get_queryset(self):
        return GroupCharterInquiry.objects.order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import GroupCharterInquiryAdminSerializer
        return GroupCharterInquiryAdminSerializer


# ── AIR CARGO ADMIN VIEWSET ───────────────────────────────────────────────────
class AirCargoAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    inquiry_type_label = 'air_cargo'
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['contact_name', 'email', 'reference', 'cargo_type']

    def get_queryset(self):
        return AirCargoInquiry.objects.order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import AirCargoInquiryAdminSerializer
        return AirCargoInquiryAdminSerializer


# ── AIRCRAFT SALES ADMIN VIEWSET ──────────────────────────────────────────────
class AircraftSalesAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    inquiry_type_label = 'aircraft_sales'
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['contact_name', 'email', 'reference', 'inquiry_type']

    def get_queryset(self):
        return AircraftSalesInquiry.objects.order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import AircraftSalesInquiryAdminSerializer
        return AircraftSalesInquiryAdminSerializer


# ── FLIGHT INQUIRY ADMIN VIEWSET ──────────────────────────────────────────────
class FlightInquiryAdminViewSet(InquiryAdminMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    inquiry_type_label = 'flight_inquiry'
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['guest_name', 'guest_email', 'reference']

    def get_queryset(self):
        return FlightInquiry.objects.order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import FlightInquirySerializer
        return FlightInquirySerializer


# ── MARKETPLACE BOOKING ADMIN VIEWSET ─────────────────────────────────────────
class MarketplaceBookingAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['client__username', 'client__email', 'aircraft__name', 'reference']

    def get_queryset(self):
        return MarketplaceBooking.objects.select_related(
            'client', 'aircraft', 'aircraft__owner', 'membership'
        ).order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import (
            MarketplaceBookingAdminSerializer,
            MarketplaceBookingCreateAdminSerializer,
        )
        if self.action == 'create':
            return MarketplaceBookingCreateAdminSerializer
        return MarketplaceBookingAdminSerializer

    def perform_create(self, serializer):
        """Admin creates booking — auto-calc commission & net"""
        d          = serializer.validated_data
        gross      = d['gross_amount_usd']
        comm_pct   = d.get('commission_pct', Decimal('10'))
        comm_usd   = (gross * comm_pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
        net        = gross - comm_usd
        serializer.save(commission_usd=comm_usd, net_owner_usd=net)

    @action(detail=True, methods=['post'])
    def send_confirmation(self, request, pk=None):
        """Email booking confirmation to client"""
        booking = self.get_object()
        custom  = request.data.get('message', '')
        body    = custom or (
            f"Dear {booking.client.get_full_name() or booking.client.username},\n\n"
            f"Your booking has been confirmed. Here are your details:\n\n"
            f"Booking Ref: {str(booking.reference)[:12]}\n"
            f"Route:       {booking.origin} → {booking.destination}\n"
            f"Departure:   {booking.departure_datetime}\n"
            f"Aircraft:    {booking.aircraft.name}\n"
            f"Passengers:  {booking.passenger_count}\n"
            f"Total:       USD ${booking.gross_amount_usd:,.2f}\n\n"
            f"Your concierge will be in touch with further details.\n\n"
            f"Warm regards,\nNairobiJetHouse Operations Team"
        )
        ok, err = _send_email_and_log(
            request.user, booking.client.email,
            booking.client.get_full_name(),
            f"Booking Confirmed – {booking.origin} → {booking.destination} | NairobiJetHouse",
            body, 'marketplace_booking', booking.id,
        )
        if ok:
            return Response({'message': 'Confirmation email sent.'})
        return Response({'error': err}, status=500)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in MarketplaceBooking.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status.'}, status=400)
        old = booking.status
        booking.status = new_status
        booking.save()
        return Response({'message': f'Status changed from {old} to {new_status}.'})


# ── USER MANAGEMENT ADMIN VIEWSET ─────────────────────────────────────────────
class UserAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['username', 'email', 'first_name', 'last_name', 'company']

    def get_queryset(self):
        return User.objects.select_related('membership', 'membership__tier').order_by('-created_at')

    def get_serializer_class(self):
        from .serializers import UserAdminSerializer
        return UserAdminSerializer

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        state = 'activated' if user.is_active else 'deactivated'
        return Response({'message': f'User {state}.', 'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        from .serializers import SendEmailSerializer
        user = self.get_object()
        ser = SendEmailSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        d = ser.validated_data
        ok, err = _send_email_and_log(
            request.user, user.email, user.get_full_name(),
            d['subject'], d['body'], d.get('inquiry_type', 'general'),
        )
        if ok:
            return Response({'message': f'Email sent to {user.email}.'})
        return Response({'error': err}, status=500)


# ── ADMIN OVERVIEW EXTENDED ───────────────────────────────────────────────────
class AdminOverviewViewSet(viewsets.ViewSet):
    """Extended overview stats for new admin tabs"""
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def inquiries_summary(self, request):
        return Response({
            'flight_bookings':  FlightBooking.objects.count(),
            'yacht_charters':   YachtCharter.objects.count(),
            'lease_inquiries':  LeaseInquiry.objects.count(),
            'flight_inquiries': FlightInquiry.objects.count(),
            'contacts':         ContactInquiry.objects.count(),
            'group_charters':   GroupCharterInquiry.objects.count(),
            'air_cargo':        AirCargoInquiry.objects.count(),
            'aircraft_sales':   AircraftSalesInquiry.objects.count(),
            'pending_flight_bookings': FlightBooking.objects.filter(status='inquiry').count(),
            'pending_yacht_charters':  YachtCharter.objects.filter(status='inquiry').count(),
            'pending_lease':           LeaseInquiry.objects.filter(status='pending').count(),
            'pending_contacts':        ContactInquiry.objects.count(),
            'pending_group_charters':  GroupCharterInquiry.objects.filter(status='pending').count(),
            'pending_air_cargo':       AirCargoInquiry.objects.filter(status='pending').count(),
            'pending_aircraft_sales':  AircraftSalesInquiry.objects.filter(status='pending').count(),
        })

    @action(detail=False, methods=['get'])
    def users_summary(self, request):
        return Response({
            'total_users':    User.objects.count(),
            'clients':        User.objects.filter(role='client').count(),
            'owners':         User.objects.filter(role='owner').count(),
            'active_members': Membership.objects.filter(status='active').count(),
            'expired':        Membership.objects.filter(status='expired').count(),
        })