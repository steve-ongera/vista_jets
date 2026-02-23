from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg,
    YachtCharter, LeaseInquiry, FlightInquiry
)

admin.site.site_header = "✈  VistaJets Admin"
admin.site.site_title = "VistaJets"
admin.site.index_title = "Operations Dashboard"


# ──────────────────────────────────────────────────────────────────────────────
# AIRPORT
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "city", "country")
    list_filter = ("country",)
    search_fields = ("code", "name", "city", "country")
    ordering = ("country", "city")
    list_per_page = 50

    fieldsets = (
        (None, {
            "fields": ("code", "name", "city", "country")
        }),
        ("Coordinates", {
            "fields": ("latitude", "longitude"),
            "classes": ("collapse",),
        }),
    )


# ──────────────────────────────────────────────────────────────────────────────
# AIRCRAFT
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = (
        "name", "model", "category_badge", "passenger_capacity",
        "range_km", "hourly_rate_usd",
        "is_available",  # ✅ ADD THIS
        "availability_badge"
    )
    list_filter = ("category", "is_available")
    search_fields = ("name", "model")
    ordering = ("category", "name")
    list_per_page = 30
    list_editable = ("is_available",)

    fieldsets = (
        ("Identity", {
            "fields": ("name", "model", "category", "is_available")
        }),
        ("Performance", {
            "fields": ("passenger_capacity", "range_km", "cruise_speed_kmh")
        }),
        ("Commercial", {
            "fields": ("hourly_rate_usd",)
        }),
        ("Presentation", {
            "fields": ("description", "amenities", "image_url"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Category")
    def category_badge(self, obj):
        colours = {
            "light":         "#6CB4E4",
            "midsize":       "#5BA55B",
            "super_midsize": "#E09F3E",
            "heavy":         "#C9A84C",
            "ultra_long":    "#9B59B6",
            "vip_airliner":  "#E05252",
        }
        colour = colours.get(obj.category, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
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
    list_display = (
        "name", "size_badge", "length_meters", "guest_capacity",
        "crew_count", "home_port", "daily_rate_usd",
        "is_available",  # ✅ ADD THIS
        "availability_badge"
    )
    list_filter = ("size_category", "is_available")
    search_fields = ("name", "home_port")
    ordering = ("size_category", "name")
    list_per_page = 30
    list_editable = ("is_available",)

    fieldsets = (
        ("Identity", {
            "fields": ("name", "size_category", "is_available", "home_port")
        }),
        ("Specifications", {
            "fields": ("length_meters", "guest_capacity", "crew_count")
        }),
        ("Commercial", {
            "fields": ("daily_rate_usd",)
        }),
        ("Presentation", {
            "fields": ("description", "amenities", "image_url"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Size")
    def size_badge(self, obj):
        colours = {
            "small":      "#6CB4E4",
            "medium":     "#5BA55B",
            "large":      "#C9A84C",
            "superyacht": "#9B59B6",
        }
        colour = colours.get(obj.size_category, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
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
    model = FlightLeg
    extra = 0
    fields = ("leg_number", "origin", "destination", "departure_date", "departure_time")
    ordering = ("leg_number",)


@admin.register(FlightBooking)
class FlightBookingAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "guest_name", "guest_email",
        "route", "departure_date", "passenger_count",
        "status_badge", "quoted_price_display", "created_at"
    )
    list_filter = (
        "status", "trip_type",
        "catering_requested", "ground_transport_requested", "concierge_requested",
        ("departure_date", admin.DateFieldListFilter),
    )
    search_fields = ("guest_name", "guest_email", "reference", "company")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at", "updated_at")
    date_hierarchy = "departure_date"
    list_per_page = 25
    inlines = [FlightLegInline]

    fieldsets = (
        ("Booking Reference", {
            "fields": ("reference", "status")
        }),
        ("Guest Information", {
            "fields": (
                ("guest_name", "guest_email"),
                ("guest_phone", "company"),
            )
        }),
        ("Flight Details", {
            "fields": (
                "trip_type",
                ("origin", "destination"),
                ("departure_date", "departure_time"),
                "return_date",
                ("passenger_count", "aircraft"),
            )
        }),
        ("Add-ons & Requests", {
            "fields": (
                ("catering_requested", "ground_transport_requested", "concierge_requested"),
                "special_requests",
            ),
            "classes": ("collapse",),
        }),
        ("Pricing", {
            "fields": ("quoted_price_usd",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_quoted", "mark_confirmed", "mark_completed", "mark_cancelled"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Route")
    def route(self, obj):
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            obj.origin.code, obj.destination.code
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {
            "inquiry":   ("#C9A84C", "#fff"),
            "quoted":    ("#6CB4E4", "#fff"),
            "confirmed": ("#50C878", "#fff"),
            "in_flight": ("#9B59B6", "#fff"),
            "completed": ("#555",    "#fff"),
            "cancelled": ("#E05252", "#fff"),
        }
        bg, fg = colours.get(obj.status, ("#888", "#fff"))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display()
        )

    @admin.display(description="Quoted Price")
    def quoted_price_display(self, obj):
        if obj.quoted_price_usd:
            return format_html(
                '<span style="color:#50C878;font-weight:600;">${:,.0f}</span>',
                obj.quoted_price_usd
            )
        return format_html('<span style="color:#888;">—</span>')

    # ── Bulk actions ──────────────────────────────────────────────────────────
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
    list_display = (
        "short_reference", "guest_name", "guest_email",
        "yacht_name", "departure_port", "charter_period",
        "guest_count", "status_badge", "quoted_price_display", "created_at"
    )
    list_filter = (
        "status",
        ("charter_start", admin.DateFieldListFilter),
    )
    search_fields = ("guest_name", "guest_email", "reference", "company", "departure_port")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at", "updated_at")
    date_hierarchy = "charter_start"
    list_per_page = 25

    fieldsets = (
        ("Charter Reference", {
            "fields": ("reference", "status")
        }),
        ("Guest Information", {
            "fields": (
                ("guest_name", "guest_email"),
                ("guest_phone", "company"),
            )
        }),
        ("Charter Details", {
            "fields": (
                "yacht",
                ("departure_port", "destination_port"),
                ("charter_start", "charter_end"),
                "guest_count",
            )
        }),
        ("Itinerary & Requests", {
            "fields": ("itinerary_description", "special_requests"),
            "classes": ("collapse",),
        }),
        ("Pricing", {
            "fields": ("quoted_price_usd",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_quoted", "mark_confirmed", "mark_completed", "mark_cancelled"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Vessel")
    def yacht_name(self, obj):
        return obj.yacht.name if obj.yacht else format_html('<span style="color:#888;">TBA</span>')

    @admin.display(description="Charter Period")
    def charter_period(self, obj):
        if obj.charter_start and obj.charter_end:
            delta = (obj.charter_end - obj.charter_start).days
            return format_html(
                '{} → {} <span style="color:#C9A84C;font-size:11px;">({} nights)</span>',
                obj.charter_start.strftime("%d %b"), obj.charter_end.strftime("%d %b"), delta
            )
        return "—"

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {
            "inquiry":   ("#C9A84C", "#fff"),
            "quoted":    ("#6CB4E4", "#fff"),
            "confirmed": ("#50C878", "#fff"),
            "active":    ("#9B59B6", "#fff"),
            "completed": ("#555",    "#fff"),
            "cancelled": ("#E05252", "#fff"),
        }
        bg, fg = colours.get(obj.status, ("#888", "#fff"))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display()
        )

    @admin.display(description="Quoted Price")
    def quoted_price_display(self, obj):
        if obj.quoted_price_usd:
            return format_html(
                '<span style="color:#50C878;font-weight:600;">${:,.0f}</span>',
                obj.quoted_price_usd
            )
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
    list_display = (
        "short_reference", "guest_name", "guest_email", "company",
        "asset_type_badge", "asset_name", "lease_duration",
        "preferred_start_date", "status_badge", "created_at"
    )
    list_filter = ("asset_type", "lease_duration", "status")
    search_fields = ("guest_name", "guest_email", "company", "reference")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Inquiry Reference", {
            "fields": ("reference", "status")
        }),
        ("Contact", {
            "fields": (
                ("guest_name", "guest_email"),
                ("guest_phone", "company"),
            )
        }),
        ("Lease Details", {
            "fields": (
                "asset_type",
                ("aircraft", "yacht"),
                ("lease_duration", "preferred_start_date"),
                "budget_range",
            )
        }),
        ("Usage & Notes", {
            "fields": ("usage_description", "additional_notes"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Asset Type")
    def asset_type_badge(self, obj):
        colour = "#6CB4E4" if obj.asset_type == "aircraft" else "#5BA55B"
        icon = "✈" if obj.asset_type == "aircraft" else "⚓"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{} {}</span>',
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
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )


# ──────────────────────────────────────────────────────────────────────────────
# FLIGHT INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(FlightInquiry)
class FlightInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "guest_name", "guest_email",
        "route_summary", "approximate_date",
        "passenger_count", "preferred_aircraft_category", "created_at"
    )
    list_filter = (
        "preferred_aircraft_category",
        ("created_at", admin.DateFieldListFilter),
    )
    search_fields = (
        "guest_name", "guest_email", "reference",
        "origin_description", "destination_description"
    )
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Inquiry Reference", {
            "fields": ("reference",)
        }),
        ("Contact", {
            "fields": (
                ("guest_name", "guest_email"),
                "guest_phone",
            )
        }),
        ("Flight Details", {
            "fields": (
                ("origin_description", "destination_description"),
                ("approximate_date", "passenger_count"),
                "preferred_aircraft_category",
            )
        }),
        ("Message", {
            "fields": ("message",)
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Route")
    def route_summary(self, obj):
        origin = obj.origin_description or "—"
        dest = obj.destination_description or "—"
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            origin[:25], dest[:25]
        )