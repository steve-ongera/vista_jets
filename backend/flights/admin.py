from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db.models import Sum, Count
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg,
    YachtCharter, LeaseInquiry, FlightInquiry,
    ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    # ── Membership system ──
    User, MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog,
    MarketplaceBooking, CommissionSetting,
    PaymentRecord, SavedRoute, Dispute,
)

admin.site.site_header = "✈  VistaJets Admin"
admin.site.site_title  = "VistaJets"
admin.site.index_title = "Operations Dashboard"


# ──────────────────────────────────────────────────────────────────────────────
# AIRPORT
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display  = ("code", "name", "city", "country")
    list_filter   = ("country",)
    search_fields = ("code", "name", "city", "country")
    ordering      = ("country", "city")
    list_per_page = 50

    fieldsets = (
        (None, {"fields": ("code", "name", "city", "country")}),
        ("Coordinates", {"fields": ("latitude", "longitude"), "classes": ("collapse",)}),
    )


# ──────────────────────────────────────────────────────────────────────────────
# AIRCRAFT
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display  = ("name", "model", "category_badge", "passenger_capacity",
                     "range_km", "hourly_rate_usd", "is_available", "availability_badge")
    list_filter   = ("category", "is_available")
    search_fields = ("name", "model")
    ordering      = ("category", "name")
    list_per_page = 30
    list_editable = ("is_available",)

    fieldsets = (
        ("Identity",     {"fields": ("name", "model", "category", "is_available")}),
        ("Performance",  {"fields": ("passenger_capacity", "range_km", "cruise_speed_kmh")}),
        ("Commercial",   {"fields": ("hourly_rate_usd",)}),
        ("Presentation", {"fields": ("description", "amenities", "image_url"), "classes": ("collapse",)}),
    )

    @admin.display(description="Category")
    def category_badge(self, obj):
        colours = {"light": "#6CB4E4", "midsize": "#5BA55B", "super_midsize": "#E09F3E",
                   "heavy": "#C9A84C", "ultra_long": "#9B59B6", "vip_airliner": "#E05252"}
        colour = colours.get(obj.category, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_category_display()
        )

    @admin.display(description="Available")
    def availability_badge(self, obj):
        if obj.is_available:
            return format_html('<span style="color:#50C878;font-weight:700;">● Yes</span>')
        return format_html('<span style="color:#E05252;font-weight:700;">● No</span>')


# ──────────────────────────────────────────────────────────────────────────────
# YACHT
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Yacht)
class YachtAdmin(admin.ModelAdmin):
    list_display  = ("name", "size_badge", "length_meters", "guest_capacity",
                     "crew_count", "home_port", "daily_rate_usd", "is_available", "availability_badge")
    list_filter   = ("size_category", "is_available")
    search_fields = ("name", "home_port")
    ordering      = ("size_category", "name")
    list_per_page = 30
    list_editable = ("is_available",)

    fieldsets = (
        ("Identity",     {"fields": ("name", "size_category", "is_available", "home_port")}),
        ("Specifications", {"fields": ("length_meters", "guest_capacity", "crew_count")}),
        ("Commercial",   {"fields": ("daily_rate_usd",)}),
        ("Presentation", {"fields": ("description", "amenities", "image_url"), "classes": ("collapse",)}),
    )

    @admin.display(description="Size")
    def size_badge(self, obj):
        colours = {"small": "#6CB4E4", "medium": "#5BA55B", "large": "#C9A84C", "superyacht": "#9B59B6"}
        colour = colours.get(obj.size_category, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_size_category_display()
        )

    @admin.display(description="Available")
    def availability_badge(self, obj):
        if obj.is_available:
            return format_html('<span style="color:#50C878;font-weight:700;">● Yes</span>')
        return format_html('<span style="color:#E05252;font-weight:700;">● No</span>')


# ──────────────────────────────────────────────────────────────────────────────
# FLIGHT BOOKING
# ──────────────────────────────────────────────────────────────────────────────
class FlightLegInline(admin.TabularInline):
    model   = FlightLeg
    extra   = 0
    fields  = ("leg_number", "origin", "destination", "departure_date", "departure_time")
    ordering = ("leg_number",)


@admin.register(FlightBooking)
class FlightBookingAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "guest_name", "guest_email", "route",
                      "departure_date", "passenger_count", "status_badge",
                      "quoted_price_display", "created_at")
    list_filter    = ("status", "trip_type", "catering_requested",
                      "ground_transport_requested", "concierge_requested",
                      ("departure_date", admin.DateFieldListFilter))
    search_fields  = ("guest_name", "guest_email", "reference", "company")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at", "updated_at")
    date_hierarchy = "departure_date"
    list_per_page  = 25
    inlines        = [FlightLegInline]

    fieldsets = (
        ("Booking Reference", {"fields": ("reference", "status")}),
        ("Guest Information", {"fields": (("guest_name", "guest_email"), ("guest_phone", "company"))}),
        ("Flight Details",    {"fields": ("trip_type", ("origin", "destination"),
                                          ("departure_date", "departure_time"), "return_date",
                                          ("passenger_count", "aircraft"))}),
        ("Add-ons & Requests", {"fields": (("catering_requested", "ground_transport_requested", "concierge_requested"),
                                            "special_requests"), "classes": ("collapse",)}),
        ("Pricing",           {"fields": ("quoted_price_usd",)}),
        ("Timestamps",        {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["mark_quoted", "mark_confirmed", "mark_completed", "mark_cancelled"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Route")
    def route(self, obj):
        return format_html('<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
                           obj.origin.code, obj.destination.code)

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"inquiry": ("#C9A84C", "#fff"), "quoted": ("#6CB4E4", "#fff"),
                   "confirmed": ("#50C878", "#fff"), "in_flight": ("#9B59B6", "#fff"),
                   "completed": ("#555", "#fff"), "cancelled": ("#E05252", "#fff")}
        bg, fg = colours.get(obj.status, ("#888", "#fff"))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display()
        )

    @admin.display(description="Quoted Price")
    def quoted_price_display(self, obj):
        if obj.quoted_price_usd:
            return format_html('<span style="color:#50C878;font-weight:600;">${:,.0f}</span>', obj.quoted_price_usd)
        return format_html('<span style="color:#888;">—</span>')

    @admin.action(description="Mark selected as Quoted")
    def mark_quoted(self, request, queryset):
        updated = queryset.filter(status="inquiry").update(status="quoted")
        self.message_user(request, f"{updated} booking(s) marked as Quoted.")

    @admin.action(description="Mark selected as Confirmed")
    def mark_confirmed(self, request, queryset):
        updated = queryset.filter(status__in=["inquiry", "quoted"]).update(status="confirmed")
        self.message_user(request, f"{updated} booking(s) marked as Confirmed.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.exclude(status="cancelled").update(status="completed")
        self.message_user(request, f"{updated} booking(s) marked as Completed.")

    @admin.action(description="Mark selected as Cancelled")
    def mark_cancelled(self, request, queryset):
        updated = queryset.exclude(status="completed").update(status="cancelled")
        self.message_user(request, f"{updated} booking(s) marked as Cancelled.")


# ──────────────────────────────────────────────────────────────────────────────
# YACHT CHARTER
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(YachtCharter)
class YachtCharterAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "guest_name", "guest_email", "yacht_name",
                      "departure_port", "charter_period", "guest_count",
                      "status_badge", "quoted_price_display", "created_at")
    list_filter    = ("status", ("charter_start", admin.DateFieldListFilter))
    search_fields  = ("guest_name", "guest_email", "reference", "company", "departure_port")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at", "updated_at")
    date_hierarchy = "charter_start"
    list_per_page  = 25

    fieldsets = (
        ("Charter Reference", {"fields": ("reference", "status")}),
        ("Guest Information", {"fields": (("guest_name", "guest_email"), ("guest_phone", "company"))}),
        ("Charter Details",   {"fields": ("yacht", ("departure_port", "destination_port"),
                                           ("charter_start", "charter_end"), "guest_count")}),
        ("Itinerary & Requests", {"fields": ("itinerary_description", "special_requests"), "classes": ("collapse",)}),
        ("Pricing",           {"fields": ("quoted_price_usd",)}),
        ("Timestamps",        {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["mark_quoted", "mark_confirmed", "mark_completed", "mark_cancelled"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Vessel")
    def yacht_name(self, obj):
        return obj.yacht.name if obj.yacht else format_html('<span style="color:#888;">TBA</span>')

    @admin.display(description="Charter Period")
    def charter_period(self, obj):
        if obj.charter_start and obj.charter_end:
            delta = (obj.charter_end - obj.charter_start).days
            return format_html('{} → {} <span style="color:#C9A84C;font-size:11px;">({} nights)</span>',
                               obj.charter_start.strftime("%d %b"), obj.charter_end.strftime("%d %b"), delta)
        return "—"

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"inquiry": ("#C9A84C", "#fff"), "quoted": ("#6CB4E4", "#fff"),
                   "confirmed": ("#50C878", "#fff"), "active": ("#9B59B6", "#fff"),
                   "completed": ("#555", "#fff"), "cancelled": ("#E05252", "#fff")}
        bg, fg = colours.get(obj.status, ("#888", "#fff"))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display()
        )

    @admin.display(description="Quoted Price")
    def quoted_price_display(self, obj):
        if obj.quoted_price_usd:
            return format_html('<span style="color:#50C878;font-weight:600;">${:,.0f}</span>', obj.quoted_price_usd)
        return format_html('<span style="color:#888;">—</span>')

    @admin.action(description="Mark selected as Quoted")
    def mark_quoted(self, request, queryset):
        updated = queryset.filter(status="inquiry").update(status="quoted")
        self.message_user(request, f"{updated} charter(s) marked as Quoted.")

    @admin.action(description="Mark selected as Confirmed")
    def mark_confirmed(self, request, queryset):
        updated = queryset.filter(status__in=["inquiry", "quoted"]).update(status="confirmed")
        self.message_user(request, f"{updated} charter(s) marked as Confirmed.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.exclude(status="cancelled").update(status="completed")
        self.message_user(request, f"{updated} charter(s) marked as Completed.")

    @admin.action(description="Mark selected as Cancelled")
    def mark_cancelled(self, request, queryset):
        updated = queryset.exclude(status="completed").update(status="cancelled")
        self.message_user(request, f"{updated} charter(s) marked as Cancelled.")


# ──────────────────────────────────────────────────────────────────────────────
# LEASE INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(LeaseInquiry)
class LeaseInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "guest_name", "guest_email", "company",
                      "asset_type_badge", "asset_name", "lease_duration",
                      "preferred_start_date", "status_badge", "created_at")
    list_filter    = ("asset_type", "lease_duration", "status")
    search_fields  = ("guest_name", "guest_email", "company", "reference")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Inquiry Reference", {"fields": ("reference", "status")}),
        ("Contact",           {"fields": (("guest_name", "guest_email"), ("guest_phone", "company"))}),
        ("Lease Details",     {"fields": ("asset_type", ("aircraft", "yacht"),
                                           ("lease_duration", "preferred_start_date"), "budget_range")}),
        ("Usage & Notes",     {"fields": ("usage_description", "additional_notes"), "classes": ("collapse",)}),
        ("Timestamps",        {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Asset Type")
    def asset_type_badge(self, obj):
        colour = "#6CB4E4" if obj.asset_type == "aircraft" else "#5BA55B"
        icon   = "✈" if obj.asset_type == "aircraft" else "⚓"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{} {}</span>',
            colour, icon, obj.get_asset_type_display()
        )

    @admin.display(description="Asset")
    def asset_name(self, obj):
        if obj.asset_type == "aircraft" and obj.aircraft:
            return obj.aircraft.name
        if obj.asset_type == "yacht" and obj.yacht:
            return obj.yacht.name
        return format_html('<span style="color:#888;">Not specified</span>')

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )


# ──────────────────────────────────────────────────────────────────────────────
# FLIGHT INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(FlightInquiry)
class FlightInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "guest_name", "guest_email", "route_summary",
                      "approximate_date", "passenger_count", "preferred_aircraft_category", "created_at")
    list_filter    = ("preferred_aircraft_category", ("created_at", admin.DateFieldListFilter))
    search_fields  = ("guest_name", "guest_email", "reference", "origin_description", "destination_description")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Inquiry Reference", {"fields": ("reference",)}),
        ("Contact",           {"fields": (("guest_name", "guest_email"), "guest_phone")}),
        ("Flight Details",    {"fields": (("origin_description", "destination_description"),
                                           ("approximate_date", "passenger_count"),
                                           "preferred_aircraft_category")}),
        ("Message",           {"fields": ("message",)}),
        ("Timestamps",        {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Route")
    def route_summary(self, obj):
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            (obj.origin_description or "—")[:25], (obj.destination_description or "—")[:25]
        )


# ──────────────────────────────────────────────────────────────────────────────
# CONTACT INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "full_name", "email", "phone",
                      "company", "subject_badge", "created_at")
    list_filter    = ("subject", ("created_at", admin.DateFieldListFilter))
    search_fields  = ("full_name", "email", "company", "reference")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Reference",  {"fields": ("reference",)}),
        ("Contact",    {"fields": (("full_name", "email"), ("phone", "company"))}),
        ("Message",    {"fields": ("subject", "message")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Subject")
    def subject_badge(self, obj):
        colours = {"general": "#6CB4E4", "support": "#E09F3E", "media": "#9B59B6",
                   "partnership": "#5BA55B", "careers": "#C9A84C", "other": "#888"}
        colour = colours.get(obj.subject, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_subject_display()
        )


# ──────────────────────────────────────────────────────────────────────────────
# GROUP CHARTER INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(GroupCharterInquiry)
class GroupCharterInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "contact_name", "email", "group_type_badge",
                      "group_size", "route_summary", "departure_date", "status_badge", "created_at")
    list_filter    = ("group_type", "status", "is_round_trip", "catering_required",
                      "ground_transport_required", ("departure_date", admin.DateFieldListFilter))
    search_fields  = ("contact_name", "email", "company", "reference",
                      "origin_description", "destination_description")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Reference",     {"fields": ("reference", "status")}),
        ("Contact",       {"fields": (("contact_name", "email"), ("phone", "company"))}),
        ("Group Details", {"fields": (("group_type", "group_size"),)}),
        ("Flight Details", {"fields": (("origin_description", "destination_description"),
                                        ("departure_date", "return_date"),
                                        "is_round_trip", "preferred_aircraft_category")}),
        ("Add-ons",       {"fields": (("catering_required", "ground_transport_required"), "budget_range")}),
        ("Notes",         {"fields": ("additional_notes",), "classes": ("collapse",)}),
        ("Timestamps",    {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Group Type")
    def group_type_badge(self, obj):
        colours = {"corporate": "#6CB4E4", "sports_team": "#5BA55B", "entertainment": "#9B59B6",
                   "incentive": "#E09F3E", "wedding": "#E05252", "government": "#C9A84C", "other": "#888"}
        colour = colours.get(obj.group_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_group_type_display()
        )

    @admin.display(description="Route")
    def route_summary(self, obj):
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            (obj.origin_description or "—")[:20], (obj.destination_description or "—")[:20]
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='pending')} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='contacted')} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='completed')} inquiry(s) marked as Completed.")


# ──────────────────────────────────────────────────────────────────────────────
# AIR CARGO INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(AirCargoInquiry)
class AirCargoInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "contact_name", "email", "company",
                      "cargo_type_badge", "route_summary", "urgency_badge",
                      "weight_kg", "status_badge", "created_at")
    list_filter    = ("cargo_type", "urgency", "status", "is_hazardous",
                      "requires_temperature_control", "insurance_required",
                      "customs_assistance_needed", ("pickup_date", admin.DateFieldListFilter))
    search_fields  = ("contact_name", "email", "company", "reference",
                      "origin_description", "destination_description", "cargo_description")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Reference",        {"fields": ("reference", "status")}),
        ("Contact",          {"fields": (("contact_name", "email"), ("phone", "company"))}),
        ("Cargo Details",    {"fields": (("cargo_type", "urgency"), "cargo_description",
                                          ("weight_kg", "volume_m3", "dimensions"))}),
        ("Route & Timeline", {"fields": (("origin_description", "destination_description"), "pickup_date")}),
        ("Special Handling", {"fields": (("is_hazardous", "requires_temperature_control"),
                                          ("insurance_required", "customs_assistance_needed"))}),
        ("Notes",            {"fields": ("additional_notes",), "classes": ("collapse",)}),
        ("Timestamps",       {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Cargo Type")
    def cargo_type_badge(self, obj):
        colours = {"general": "#6CB4E4", "perishables": "#5BA55B", "pharma": "#9B59B6",
                   "dangerous_goods": "#E05252", "live_animals": "#E09F3E", "artwork": "#C9A84C",
                   "automotive": "#888", "oversized": "#555", "humanitarian": "#50C878", "other": "#aaa"}
        colour = colours.get(obj.cargo_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_cargo_type_display()
        )

    @admin.display(description="Route")
    def route_summary(self, obj):
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            (obj.origin_description or "—")[:18], (obj.destination_description or "—")[:18]
        )

    @admin.display(description="Urgency")
    def urgency_badge(self, obj):
        colours = {"standard": "#6CB4E4", "express": "#E09F3E", "critical": "#E05252"}
        colour = colours.get(obj.urgency, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_urgency_display()
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='pending')} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='contacted')} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='completed')} inquiry(s) marked as Completed.")


# ──────────────────────────────────────────────────────────────────────────────
# AIRCRAFT SALES INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(AircraftSalesInquiry)
class AircraftSalesInquiryAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "contact_name", "email", "company",
                      "inquiry_type_badge", "aircraft_summary", "budget_range",
                      "status_badge", "created_at")
    list_filter    = ("inquiry_type", "status", "new_or_pre_owned",
                      "preferred_category", "budget_range",
                      ("created_at", admin.DateFieldListFilter))
    search_fields  = ("contact_name", "email", "company", "reference",
                      "aircraft_make", "aircraft_model", "serial_number")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 25

    fieldsets = (
        ("Reference",          {"fields": ("reference", "status")}),
        ("Contact",            {"fields": (("contact_name", "email"), ("phone", "company"))}),
        ("Inquiry Type",       {"fields": ("inquiry_type",)}),
        ("Buyer Requirements", {"fields": (("preferred_category", "preferred_make_model"),
                                            ("budget_range", "new_or_pre_owned")), "classes": ("collapse",)}),
        ("Seller / Trade",     {"fields": (("aircraft_make", "aircraft_model"),
                                            ("year_of_manufacture", "serial_number"),
                                            ("total_flight_hours", "asking_price_usd")), "classes": ("collapse",)}),
        ("Message",            {"fields": ("message",), "classes": ("collapse",)}),
        ("Timestamps",         {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Inquiry Type")
    def inquiry_type_badge(self, obj):
        colours = {"buy": "#50C878", "sell": "#6CB4E4", "trade": "#E09F3E", "valuation": "#9B59B6"}
        colour = colours.get(obj.inquiry_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_inquiry_type_display()
        )

    @admin.display(description="Aircraft")
    def aircraft_summary(self, obj):
        if obj.aircraft_make and obj.aircraft_model:
            year = f" ({obj.year_of_manufacture})" if obj.year_of_manufacture else ""
            return format_html('<strong>{} {}</strong><span style="color:#888;font-size:11px;">{}</span>',
                               obj.aircraft_make, obj.aircraft_model, year)
        if obj.preferred_make_model:
            return format_html('<span style="color:#888;">Seeking: {}</span>', obj.preferred_make_model)
        return format_html('<span style="color:#aaa;">—</span>')

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='pending')} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='contacted')} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='completed')} inquiry(s) marked as Completed.")


# ══════════════════════════════════════════════════════════════════════════════
# ✈  MEMBERSHIP SYSTEM MODELS
# ══════════════════════════════════════════════════════════════════════════════


# ──────────────────────────────────────────────────────────────────────────────
# CUSTOM USER
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ("username", "email", "full_name", "role_badge",
                      "membership_status", "is_active", "date_joined")
    list_filter    = ("role", "is_active", "is_staff")
    search_fields  = ("username", "email", "first_name", "last_name", "phone", "company")
    ordering       = ("-date_joined",)
    list_per_page  = 30

    # Extend base fieldsets with our custom fields
    fieldsets = BaseUserAdmin.fieldsets + (
        ("VistaJets Profile", {
            "fields": ("role", "phone", "company", "avatar_url"),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("VistaJets Profile", {
            "fields": ("role", "phone", "company"),
        }),
    )

    @admin.display(description="Name")
    def full_name(self, obj):
        return obj.get_full_name() or format_html('<span style="color:#aaa;">—</span>')

    @admin.display(description="Role")
    def role_badge(self, obj):
        colours = {"client": "#6CB4E4", "owner": "#C9A84C", "admin": "#E05252"}
        icons   = {"client": "👤", "owner": "✈", "admin": "🔐"}
        colour  = colours.get(obj.role, "#888")
        icon    = icons.get(obj.role, "")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:3px;font-size:11px;font-weight:600;">{} {}</span>',
            colour, icon, obj.get_role_display()
        )

    @admin.display(description="Membership")
    def membership_status(self, obj):
        try:
            m = obj.membership
            colours = {"active": "#50C878", "expired": "#E05252",
                       "suspended": "#E09F3E", "pending": "#C9A84C", "cancelled": "#888"}
            colour = colours.get(m.status, "#888")
            return format_html(
                '<span style="color:{};font-weight:700;">● {} – {}</span>',
                colour, m.tier.display_name, m.status.title()
            )
        except Exception:
            return format_html('<span style="color:#aaa;">No membership</span>')


# ──────────────────────────────────────────────────────────────────────────────
# MEMBERSHIP TIER
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display   = ("tier_badge", "display_name", "monthly_fee_usd", "annual_fee_usd",
                      "hourly_discount_pct", "priority_booking", "dedicated_support",
                      "exclusive_listings", "max_monthly_bookings", "is_active")
    list_filter    = ("name", "is_active", "priority_booking", "dedicated_support")
    search_fields  = ("name", "display_name")
    ordering       = ("name",)
    list_editable  = ("is_active",)
    list_per_page  = 10

    fieldsets = (
        ("Tier Identity",   {"fields": ("name", "display_name", "is_active", "description")}),
        ("Pricing",         {"fields": ("monthly_fee_usd", "annual_fee_usd", "hourly_discount_pct")}),
        ("Perks",           {"fields": ("priority_booking", "dedicated_support",
                                         "exclusive_listings", "max_monthly_bookings")}),
        ("Features List",   {"fields": ("features_list",),
                              "description": "JSON list of feature strings shown on pricing page"}),
    )

    @admin.display(description="Tier")
    def tier_badge(self, obj):
        colours = {"basic": "#6CB4E4", "premium": "#C9A84C", "corporate": "#0b1d3a"}
        colour  = colours.get(obj.name, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:3px;font-size:11px;font-weight:700;">{}</span>',
            colour, obj.name.upper()
        )


# ──────────────────────────────────────────────────────────────────────────────
# MEMBERSHIP  (inline on User is optional — registered standalone here)
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "user_link", "user_email", "tier_badge",
                      "status_badge", "billing_cycle", "start_date", "end_date",
                      "days_remaining_display", "auto_renew", "amount_paid")
    list_filter    = ("status", "billing_cycle", "auto_renew", "tier",
                      ("end_date", admin.DateFieldListFilter))
    search_fields  = ("user__username", "user__email", "user__first_name",
                      "user__last_name", "reference", "stripe_sub_id")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at", "updated_at", "days_remaining", "is_active")
    list_per_page  = 30
    date_hierarchy = "created_at"

    fieldsets = (
        ("Reference",    {"fields": ("reference",)}),
        ("Member",       {"fields": ("user", "tier")}),
        ("Status",       {"fields": ("status", "is_active", "days_remaining")}),
        ("Billing",      {"fields": ("billing_cycle", "auto_renew", "amount_paid", "stripe_sub_id")}),
        ("Validity",     {"fields": ("start_date", "end_date")}),
        ("Timestamps",   {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["mark_active", "mark_suspended", "mark_cancelled"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Member")
    def user_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.user.pk])
        return format_html('<a href="{}" style="font-weight:600;">{}</a>', url, obj.user.get_full_name() or obj.user.username)

    @admin.display(description="Email")
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description="Tier")
    def tier_badge(self, obj):
        colours = {"basic": "#6CB4E4", "premium": "#C9A84C", "corporate": "#0b1d3a"}
        colour  = colours.get(obj.tier.name, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.tier.display_name
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"active": "#50C878", "expired": "#E05252",
                   "suspended": "#E09F3E", "pending": "#C9A84C", "cancelled": "#888"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.display(description="Days Left")
    def days_remaining_display(self, obj):
        days = obj.days_remaining
        if days is None:
            return format_html('<span style="color:#aaa;">—</span>')
        colour = "#50C878" if days > 30 else "#E09F3E" if days > 7 else "#E05252"
        return format_html('<span style="color:{};font-weight:700;">{} days</span>', colour, days)

    @admin.action(description="Mark selected as Active")
    def mark_active(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='active')} membership(s) activated.")

    @admin.action(description="Mark selected as Suspended")
    def mark_suspended(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='suspended')} membership(s) suspended.")

    @admin.action(description="Mark selected as Cancelled")
    def mark_cancelled(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='cancelled')} membership(s) cancelled.")


# ──────────────────────────────────────────────────────────────────────────────
# MARKETPLACE AIRCRAFT
# ──────────────────────────────────────────────────────────────────────────────
class MaintenanceLogInline(admin.TabularInline):
    model   = MaintenanceLog
    extra   = 0
    fields  = ("maintenance_type", "status", "scheduled_date", "flight_hours_at", "cost_usd")
    ordering = ("-scheduled_date",)
    show_change_link = True


@admin.register(MarketplaceAircraft)
class MarketplaceAircraftAdmin(admin.ModelAdmin):
    list_display   = ("name", "registration_number", "owner_link", "category_badge",
                      "status_badge", "is_approved", "base_location",
                      "hourly_rate_usd", "total_flight_hours",
                      "maintenance_health", "insurance_expiry")
    list_filter    = ("status", "category", "is_approved",
                      ("insurance_expiry", admin.DateFieldListFilter),
                      ("airworthiness_expiry", admin.DateFieldListFilter))
    search_fields  = ("name", "model", "registration_number",
                      "owner__username", "owner__email", "base_location")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "hours_until_maintenance", "maintenance_due",
                        "created_at", "updated_at")
    list_per_page  = 25
    list_editable  = ("is_approved",)
    inlines        = [MaintenanceLogInline]

    fieldsets = (
        ("Reference",     {"fields": ("reference",)}),
        ("Owner",         {"fields": ("owner",)}),
        ("Identity",      {"fields": ("name", "model", "category", "registration_number", "base_location")}),
        ("Specifications", {"fields": ("passenger_capacity", "range_km", "cruise_speed_kmh")}),
        ("Commercial",    {"fields": ("hourly_rate_usd", "status", "is_approved", "exclusive_tiers")}),
        ("Flight Tracking", {"fields": ("total_flight_hours", "maintenance_interval_hours",
                                          "last_maintenance_hours", "hours_until_maintenance",
                                          "maintenance_due")}),
        ("Compliance",    {"fields": ("insurance_expiry", "airworthiness_expiry")}),
        ("Presentation",  {"fields": ("description", "amenities", "image_url"), "classes": ("collapse",)}),
        ("Timestamps",    {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["approve_aircraft", "mark_available", "mark_maintenance", "mark_inactive"]

    @admin.display(description="Owner")
    def owner_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.owner.pk])
        return format_html('<a href="{}">{}</a>', url, obj.owner.get_full_name() or obj.owner.username)

    @admin.display(description="Category")
    def category_badge(self, obj):
        colours = {"light": "#6CB4E4", "midsize": "#5BA55B", "super_midsize": "#E09F3E",
                   "heavy": "#C9A84C", "ultra_long": "#9B59B6", "vip_airliner": "#E05252"}
        colour = colours.get(obj.category, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_category_display()
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"available": "#50C878", "in_flight": "#6CB4E4",
                   "maintenance": "#E09F3E", "inactive": "#888", "pending": "#C9A84C"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.display(description="Maintenance")
    def maintenance_health(self, obj):
        hours = obj.hours_until_maintenance
        if hours <= 0:
            return format_html('<span style="color:#E05252;font-weight:700;">⚠ OVERDUE</span>')
        elif hours <= 10:
            return format_html('<span style="color:#E05252;font-weight:700;">⚠ {:.0f}h left</span>', hours)
        elif hours <= 25:
            return format_html('<span style="color:#E09F3E;font-weight:700;">⚡ {:.0f}h left</span>', hours)
        return format_html('<span style="color:#50C878;">{:.0f}h left</span>', hours)

    @admin.action(description="✅ Approve & list selected aircraft")
    def approve_aircraft(self, request, queryset):
        updated = queryset.update(is_approved=True, status="available")
        self.message_user(request, f"{updated} aircraft approved and listed.")

    @admin.action(description="Set selected as Available")
    def mark_available(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='available')} aircraft set to Available.")

    @admin.action(description="Set selected as Under Maintenance")
    def mark_maintenance(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='maintenance')} aircraft set to Maintenance.")

    @admin.action(description="Set selected as Inactive")
    def mark_inactive(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='inactive')} aircraft set to Inactive.")


# ──────────────────────────────────────────────────────────────────────────────
# MAINTENANCE LOG
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display   = ("aircraft_link", "type_badge", "status_badge",
                      "scheduled_date", "completed_date",
                      "flight_hours_at", "cost_display", "technician")
    list_filter    = ("maintenance_type", "status",
                      ("scheduled_date", admin.DateFieldListFilter))
    search_fields  = ("aircraft__name", "aircraft__registration_number",
                      "description", "technician")
    ordering       = ("-scheduled_date",)
    readonly_fields = ("created_at",)
    list_per_page  = 30

    fieldsets = (
        ("Aircraft",    {"fields": ("aircraft",)}),
        ("Maintenance", {"fields": ("maintenance_type", "status", "description", "technician")}),
        ("Scheduling",  {"fields": ("scheduled_date", "completed_date", "flight_hours_at")}),
        ("Financials",  {"fields": ("cost_usd",)}),
        ("Notes",       {"fields": ("notes",), "classes": ("collapse",)}),
        ("Timestamps",  {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_completed", "mark_in_progress", "mark_cancelled"]

    @admin.display(description="Aircraft")
    def aircraft_link(self, obj):
        url = reverse("admin:flights_marketplaceaircraft_change", args=[obj.aircraft.pk])
        return format_html('<a href="{}" style="font-weight:600;">{}</a>', url, obj.aircraft.name)

    @admin.display(description="Type")
    def type_badge(self, obj):
        colours = {"routine": "#6CB4E4", "repair": "#E09F3E", "inspection": "#5BA55B",
                   "upgrade": "#9B59B6", "emergency": "#E05252"}
        colour = colours.get(obj.maintenance_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_maintenance_type_display()
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"scheduled": "#C9A84C", "in_progress": "#6CB4E4",
                   "completed": "#50C878", "cancelled": "#888"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.display(description="Cost")
    def cost_display(self, obj):
        if obj.cost_usd:
            return format_html('<span style="font-weight:600;">${:,.0f}</span>', obj.cost_usd)
        return format_html('<span style="color:#aaa;">—</span>')

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.update(status="completed", completed_date=timezone.now().date())
        self.message_user(request, f"{updated} maintenance log(s) marked as Completed.")

    @admin.action(description="Mark selected as In Progress")
    def mark_in_progress(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='in_progress')} log(s) set to In Progress.")

    @admin.action(description="Mark selected as Cancelled")
    def mark_cancelled(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='cancelled')} log(s) cancelled.")


# ──────────────────────────────────────────────────────────────────────────────
# MARKETPLACE BOOKING
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(MarketplaceBooking)
class MarketplaceBookingAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "client_link", "aircraft_link",
                      "route", "departure_datetime", "passenger_count",
                      "status_badge", "payment_badge",
                      "gross_amount_display", "commission_display", "net_display")
    list_filter    = ("status", "payment_status", "trip_type",
                      ("departure_datetime", admin.DateFieldListFilter))
    search_fields  = ("client__username", "client__email", "reference",
                      "origin", "destination", "aircraft__name",
                      "aircraft__registration_number", "stripe_payment_id")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "commission_usd", "net_owner_usd", "created_at", "updated_at")
    date_hierarchy = "departure_datetime"
    list_per_page  = 25

    fieldsets = (
        ("Reference",   {"fields": ("reference", "status", "payment_status")}),
        ("Parties",     {"fields": ("client", "aircraft", "membership")}),
        ("Trip",        {"fields": ("trip_type", ("origin", "destination"),
                                    "departure_datetime", "return_datetime",
                                    ("estimated_hours", "passenger_count"))}),
        ("Financials",  {"fields": ("gross_amount_usd", "commission_pct", "commission_usd",
                                     "net_owner_usd", "discount_applied")}),
        ("Payment",     {"fields": ("stripe_payment_id",)}),
        ("Requests",    {"fields": ("special_requests",), "classes": ("collapse",)}),
        ("Timestamps",  {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["mark_confirmed", "mark_completed", "mark_cancelled", "mark_disputed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Client")
    def client_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.client.pk])
        return format_html('<a href="{}">{}</a>', url, obj.client.get_full_name() or obj.client.username)

    @admin.display(description="Aircraft")
    def aircraft_link(self, obj):
        url = reverse("admin:flights_marketplaceaircraft_change", args=[obj.aircraft.pk])
        return format_html('<a href="{}">{}</a>', url, obj.aircraft.name)

    @admin.display(description="Route")
    def route(self, obj):
        return format_html('<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
                           obj.origin[:20], obj.destination[:20])

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"pending": "#C9A84C", "confirmed": "#50C878", "in_flight": "#6CB4E4",
                   "completed": "#555", "cancelled": "#E05252", "disputed": "#9B59B6"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.display(description="Payment")
    def payment_badge(self, obj):
        colour = "#50C878" if obj.payment_status == "paid" else "#E05252"
        return format_html('<span style="color:{};font-weight:700;">● {}</span>', colour, obj.payment_status.title())

    @admin.display(description="Gross")
    def gross_amount_display(self, obj):
        return format_html('<span style="font-weight:700;">${:,.0f}</span>', obj.gross_amount_usd)

    @admin.display(description="Commission")
    def commission_display(self, obj):
        return format_html('<span style="color:#C9A84C;font-weight:600;">${:,.0f}</span>', obj.commission_usd)

    @admin.display(description="Owner Net")
    def net_display(self, obj):
        return format_html('<span style="color:#50C878;font-weight:600;">${:,.0f}</span>', obj.net_owner_usd)

    @admin.action(description="Mark selected as Confirmed")
    def mark_confirmed(self, request, queryset):
        self.message_user(request, f"{queryset.filter(status='pending').update(status='confirmed')} booking(s) confirmed.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        self.message_user(request, f"{queryset.exclude(status='cancelled').update(status='completed')} booking(s) completed.")

    @admin.action(description="Mark selected as Cancelled")
    def mark_cancelled(self, request, queryset):
        self.message_user(request, f"{queryset.exclude(status='completed').update(status='cancelled')} booking(s) cancelled.")

    @admin.action(description="Mark selected as Disputed")
    def mark_disputed(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='disputed')} booking(s) flagged as Disputed.")


# ──────────────────────────────────────────────────────────────────────────────
# COMMISSION SETTING
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(CommissionSetting)
class CommissionSettingAdmin(admin.ModelAdmin):
    list_display   = ("rate_pct", "effective_from", "owner_net", "set_by_name", "notes_preview", "created_at")
    ordering       = ("-effective_from",)
    readonly_fields = ("created_at", "set_by")
    list_per_page  = 20

    fieldsets = (
        ("Rate",       {"fields": ("rate_pct", "effective_from")}),
        ("Notes",      {"fields": ("notes",)}),
        ("Audit",      {"fields": ("set_by", "created_at"), "classes": ("collapse",)}),
    )

    def save_model(self, request, obj, form, change):
        obj.set_by = request.user
        super().save_model(request, obj, form, change)

    @admin.display(description="Owner Receives")
    def owner_net(self, obj):
        net = 100 - float(obj.rate_pct)
        return format_html('<span style="color:#50C878;font-weight:700;">{:.1f}%</span>', net)

    @admin.display(description="Set By")
    def set_by_name(self, obj):
        if obj.set_by:
            return obj.set_by.get_full_name() or obj.set_by.username
        return format_html('<span style="color:#aaa;">—</span>')

    @admin.display(description="Notes")
    def notes_preview(self, obj):
        return (obj.notes[:60] + "…") if len(obj.notes) > 60 else obj.notes or "—"


# ──────────────────────────────────────────────────────────────────────────────
# PAYMENT RECORD
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "user_link", "type_badge", "amount_display",
                      "currency", "status_badge", "stripe_id_short", "created_at")
    list_filter    = ("payment_type", "status", "currency",
                      ("created_at", admin.DateFieldListFilter))
    search_fields  = ("user__username", "user__email", "reference",
                      "stripe_payment_id", "description")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page  = 30
    date_hierarchy = "created_at"

    fieldsets = (
        ("Reference",  {"fields": ("reference",)}),
        ("Parties",    {"fields": ("user", "booking", "membership")}),
        ("Payment",    {"fields": ("payment_type", "amount_usd", "currency", "status")}),
        ("Stripe",     {"fields": ("stripe_payment_id", "stripe_receipt_url")}),
        ("Details",    {"fields": ("description",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="User")
    def user_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)

    @admin.display(description="Type")
    def type_badge(self, obj):
        colours = {"membership": "#6CB4E4", "booking": "#C9A84C", "refund": "#E05252"}
        colour = colours.get(obj.payment_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_payment_type_display()
        )

    @admin.display(description="Amount")
    def amount_display(self, obj):
        return format_html('<span style="font-weight:700;">${:,.2f}</span>', obj.amount_usd)

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"pending": "#C9A84C", "succeeded": "#50C878", "failed": "#E05252", "refunded": "#888"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.display(description="Stripe ID")
    def stripe_id_short(self, obj):
        if obj.stripe_payment_id:
            return format_html('<span style="font-family:monospace;font-size:10px;color:#888;">{}</span>',
                               obj.stripe_payment_id[:20] + "…")
        return format_html('<span style="color:#aaa;">—</span>')


# ──────────────────────────────────────────────────────────────────────────────
# SAVED ROUTE
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(SavedRoute)
class SavedRouteAdmin(admin.ModelAdmin):
    list_display   = ("name", "user_link", "origin", "destination", "created_at")
    list_filter    = (("created_at", admin.DateFieldListFilter),)
    search_fields  = ("user__username", "user__email", "name", "origin", "destination")
    ordering       = ("-created_at",)
    readonly_fields = ("created_at",)
    list_per_page  = 30

    fieldsets = (
        ("Route",      {"fields": ("user", "name", "origin", "destination")}),
        ("Notes",      {"fields": ("notes",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    @admin.display(description="User")
    def user_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)


# ──────────────────────────────────────────────────────────────────────────────
# DISPUTE
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display   = ("short_reference", "subject_preview", "raised_by_link",
                      "booking_link", "status_badge", "created_at", "resolved_at")
    list_filter    = ("status", ("created_at", admin.DateFieldListFilter),
                      ("resolved_at", admin.DateFieldListFilter))
    search_fields  = ("raised_by__username", "raised_by__email", "reference",
                      "subject", "description", "resolution")
    ordering       = ("-created_at",)
    readonly_fields = ("reference", "created_at", "resolved_at")
    list_per_page  = 25

    fieldsets = (
        ("Reference",   {"fields": ("reference", "status")}),
        ("Parties",     {"fields": ("raised_by", "booking")}),
        ("Dispute",     {"fields": ("subject", "description")}),
        ("Resolution",  {"fields": ("resolution", "resolved_at")}),
        ("Timestamps",  {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_reviewing", "mark_resolved", "mark_closed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html('<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>', ref, ref[:8] + "…")

    @admin.display(description="Subject")
    def subject_preview(self, obj):
        subject = obj.subject[:55] + "…" if len(obj.subject) > 55 else obj.subject
        return format_html('<span style="font-weight:600;">{}</span>', subject)

    @admin.display(description="Raised By")
    def raised_by_link(self, obj):
        url = reverse("admin:flights_user_change", args=[obj.raised_by.pk])
        return format_html('<a href="{}">{}</a>', url, obj.raised_by.get_full_name() or obj.raised_by.username)

    @admin.display(description="Booking")
    def booking_link(self, obj):
        url = reverse("admin:flights_marketplacebooking_change", args=[obj.booking.pk])
        ref = str(obj.booking.reference)[:8]
        return format_html('<a href="{}" style="font-family:monospace;font-size:11px;">{}…</a>', url, ref)

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {"open": "#E05252", "reviewing": "#E09F3E",
                   "resolved": "#50C878", "closed": "#888"}
        colour = colours.get(obj.status, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_status_display()
        )

    @admin.action(description="Mark selected as Under Review")
    def mark_reviewing(self, request, queryset):
        self.message_user(request, f"{queryset.filter(status='open').update(status='reviewing')} dispute(s) set to Under Review.")

    @admin.action(description="Mark selected as Resolved")
    def mark_resolved(self, request, queryset):
        updated = queryset.exclude(status="closed").update(status="resolved", resolved_at=timezone.now())
        self.message_user(request, f"{updated} dispute(s) marked as Resolved.")

    @admin.action(description="Mark selected as Closed")
    def mark_closed(self, request, queryset):
        self.message_user(request, f"{queryset.update(status='closed')} dispute(s) closed.")