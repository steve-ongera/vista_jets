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