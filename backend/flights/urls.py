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
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from .views import (
    AuthViewSet,
    MembershipTierViewSet,
    MembershipViewSet,
    MarketplaceAircraftViewSet,
    MaintenanceLogViewSet,
    MarketplaceBookingViewSet,
    CommissionSettingViewSet,
    PaymentRecordViewSet,
    SavedRouteViewSet,
    DisputeViewSet,
    ClientDashboardViewSet,
    OwnerDashboardViewSet,
    AdminDashboardViewSet,
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
#New
router.register('auth',               AuthViewSet,                  basename='auth')
router.register('membership-tiers',   MembershipTierViewSet,        basename='membership-tiers')
router.register('memberships',        MembershipViewSet,            basename='memberships')
router.register('marketplace/aircraft', MarketplaceAircraftViewSet, basename='marketplace-aircraft')
router.register('marketplace/maintenance', MaintenanceLogViewSet,   basename='maintenance')
router.register('marketplace/bookings', MarketplaceBookingViewSet,  basename='marketplace-bookings')
router.register('commissions',        CommissionSettingViewSet,     basename='commissions')
router.register('payments',           PaymentRecordViewSet,         basename='payments')
router.register('saved-routes',       SavedRouteViewSet,            basename='saved-routes')
router.register('disputes',           DisputeViewSet,               basename='disputes')
router.register('dashboard/client',   ClientDashboardViewSet,       basename='client-dashboard')
router.register('dashboard/owner',    OwnerDashboardViewSet,        basename='owner-dashboard')
router.register('dashboard/admin',    AdminDashboardViewSet,        basename='admin-dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('quick-quote/', QuickQuoteView.as_view(), name='quick-quote'),
]