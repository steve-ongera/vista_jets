from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AirportViewSet, AircraftViewSet, YachtViewSet,
    FlightBookingViewSet, YachtCharterViewSet,
    LeaseInquiryViewSet, FlightInquiryViewSet,
    QuickQuoteView
)

router = DefaultRouter()
router.register(r'airports', AirportViewSet, basename='airport')
router.register(r'aircraft', AircraftViewSet, basename='aircraft')
router.register(r'yachts', YachtViewSet, basename='yacht')
router.register(r'flight-bookings', FlightBookingViewSet, basename='flight-booking')
router.register(r'yacht-charters', YachtCharterViewSet, basename='yacht-charter')
router.register(r'lease-inquiries', LeaseInquiryViewSet, basename='lease-inquiry')
router.register(r'flight-inquiries', FlightInquiryViewSet, basename='flight-inquiry')

urlpatterns = [
    path('', include(router.urls)),
    path('quick-quote/', QuickQuoteView.as_view(), name='quick-quote'),
]