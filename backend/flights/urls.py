from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AirportViewSet, AircraftViewSet, YachtViewSet,
    FlightBookingViewSet, YachtCharterViewSet,
    LeaseInquiryViewSet, FlightInquiryViewSet,
    QuickQuoteView,
    # NEW
    ContactInquiryViewSet, GroupCharterInquiryViewSet,
    AirCargoInquiryViewSet, AircraftSalesInquiryViewSet,
)

router = DefaultRouter()
router.register(r'airports', AirportViewSet, basename='airport')
router.register(r'aircraft', AircraftViewSet, basename='aircraft')
router.register(r'yachts', YachtViewSet, basename='yacht')
router.register(r'flight-bookings', FlightBookingViewSet, basename='flight-booking')
router.register(r'yacht-charters', YachtCharterViewSet, basename='yacht-charter')
router.register(r'lease-inquiries', LeaseInquiryViewSet, basename='lease-inquiry')
router.register(r'flight-inquiries', FlightInquiryViewSet, basename='flight-inquiry')
# NEW
router.register(r'contact', ContactInquiryViewSet, basename='contact')
router.register(r'group-charters', GroupCharterInquiryViewSet, basename='group-charter')
router.register(r'air-cargo', AirCargoInquiryViewSet, basename='air-cargo')
router.register(r'aircraft-sales', AircraftSalesInquiryViewSet, basename='aircraft-sales')

urlpatterns = [
    path('', include(router.urls)),
    path('quick-quote/', QuickQuoteView.as_view(), name='quick-quote'),
]