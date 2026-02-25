# urls.py — FULL REPLACEMENT
# Replace your existing urls.py with this

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Public
    AirportViewSet, AircraftViewSet, YachtViewSet,
    FlightBookingViewSet, YachtCharterViewSet,
    LeaseInquiryViewSet, FlightInquiryViewSet,
    QuickQuoteView,
    ContactInquiryViewSet, GroupCharterInquiryViewSet,
    AirCargoInquiryViewSet, AircraftSalesInquiryViewSet,
    # Membership
    AuthViewSet, MembershipTierViewSet, MembershipViewSet,
    MarketplaceAircraftViewSet, MaintenanceLogViewSet,
    MarketplaceBookingViewSet, CommissionSettingViewSet,
    PaymentRecordViewSet, SavedRouteViewSet, DisputeViewSet,
    ClientDashboardViewSet, OwnerDashboardViewSet, AdminDashboardViewSet,
)
from .views import (
    EmailLogViewSet,
    PriceCalculatorViewSet,
    FlightBookingAdminViewSet,
    YachtCharterAdminViewSet,
    LeaseInquiryAdminViewSet,
    ContactInquiryAdminViewSet,
    GroupCharterAdminViewSet,
    AirCargoAdminViewSet,
    AircraftSalesAdminViewSet,
    FlightInquiryAdminViewSet,
    MarketplaceBookingAdminViewSet,
    UserAdminViewSet,
    AdminOverviewViewSet,
)

router = DefaultRouter()

# ── PUBLIC ────────────────────────────────────────────────────────────────────
router.register(r'airports',          AirportViewSet,            basename='airport')
router.register(r'aircraft',          AircraftViewSet,           basename='aircraft')
router.register(r'yachts',            YachtViewSet,              basename='yacht')
router.register(r'flight-bookings',   FlightBookingViewSet,      basename='flight-booking')
router.register(r'yacht-charters',    YachtCharterViewSet,       basename='yacht-charter')
router.register(r'lease-inquiries',   LeaseInquiryViewSet,       basename='lease-inquiry')
router.register(r'flight-inquiries',  FlightInquiryViewSet,      basename='flight-inquiry')
router.register(r'contact',           ContactInquiryViewSet,     basename='contact')
router.register(r'group-charters',    GroupCharterInquiryViewSet,basename='group-charter')
router.register(r'air-cargo',         AirCargoInquiryViewSet,    basename='air-cargo')
router.register(r'aircraft-sales',    AircraftSalesInquiryViewSet,basename='aircraft-sales')

# ── AUTH & MEMBERSHIP ─────────────────────────────────────────────────────────
router.register(r'auth',               AuthViewSet,               basename='auth')
router.register(r'membership-tiers',   MembershipTierViewSet,     basename='membership-tiers')
router.register(r'memberships',        MembershipViewSet,         basename='memberships')

# ── MARKETPLACE ───────────────────────────────────────────────────────────────
router.register(r'marketplace/aircraft',    MarketplaceAircraftViewSet, basename='marketplace-aircraft')
router.register(r'marketplace/maintenance', MaintenanceLogViewSet,      basename='maintenance')
router.register(r'marketplace/bookings',    MarketplaceBookingViewSet,  basename='marketplace-bookings')

# ── PLATFORM ──────────────────────────────────────────────────────────────────
router.register(r'commissions',  CommissionSettingViewSet, basename='commissions')
router.register(r'payments',     PaymentRecordViewSet,     basename='payments')
router.register(r'saved-routes', SavedRouteViewSet,        basename='saved-routes')
router.register(r'disputes',     DisputeViewSet,           basename='disputes')

# ── DASHBOARDS ────────────────────────────────────────────────────────────────
router.register(r'dashboard/client', ClientDashboardViewSet, basename='client-dashboard')
router.register(r'dashboard/owner',  OwnerDashboardViewSet,  basename='owner-dashboard')
router.register(r'dashboard/admin',  AdminDashboardViewSet,  basename='admin-dashboard')

# ── ADMIN CRUD & TOOLS ────────────────────────────────────────────────────────
router.register(r'admin/email-logs',         EmailLogViewSet,               basename='admin-email-logs')
router.register(r'admin/price-calculator',   PriceCalculatorViewSet,        basename='admin-price-calc')
router.register(r'admin/flight-bookings',    FlightBookingAdminViewSet,     basename='admin-flight-bookings')
router.register(r'admin/yacht-charters',     YachtCharterAdminViewSet,      basename='admin-yacht-charters')
router.register(r'admin/lease-inquiries',    LeaseInquiryAdminViewSet,      basename='admin-lease')
router.register(r'admin/contacts',           ContactInquiryAdminViewSet,    basename='admin-contacts')
router.register(r'admin/group-charters',     GroupCharterAdminViewSet,      basename='admin-group-charters')
router.register(r'admin/air-cargo',          AirCargoAdminViewSet,          basename='admin-air-cargo')
router.register(r'admin/aircraft-sales',     AircraftSalesAdminViewSet,     basename='admin-aircraft-sales')
router.register(r'admin/flight-inquiries',   FlightInquiryAdminViewSet,     basename='admin-flight-inquiries')
router.register(r'admin/marketplace-bookings', MarketplaceBookingAdminViewSet, basename='admin-mp-bookings')
router.register(r'admin/users',              UserAdminViewSet,              basename='admin-users')
router.register(r'admin/overview',           AdminOverviewViewSet,          basename='admin-overview')

urlpatterns = [
    path('', include(router.urls)),
    path('quick-quote/',          QuickQuoteView.as_view(), name='quick-quote'),
    path('auth/token/refresh/',   TokenRefreshView.as_view(), name='token-refresh'),
]