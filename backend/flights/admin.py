from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg,
    YachtCharter, LeaseInquiry, FlightInquiry,
    ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry  # ← add this line
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
            formatted_price = f"{obj.quoted_price_usd:,.0f}"
            return format_html(
                '<span style="color:#50C878;font-weight:600;">${}</span>',
                formatted_price
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
        
        
        
# ── ADD to the import at the top of admin.py ──────────────────────────────────
# from .models import (
#     ...existing...,
#     ContactInquiry, GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry
# )


# ──────────────────────────────────────────────────────────────────────────────
# CONTACT INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "full_name", "email", "phone",
        "company", "subject_badge", "created_at"
    )
    list_filter = (
        "subject",
        ("created_at", admin.DateFieldListFilter),
    )
    search_fields = ("full_name", "email", "company", "reference")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Reference", {
            "fields": ("reference",)
        }),
        ("Contact", {
            "fields": (
                ("full_name", "email"),
                ("phone", "company"),
            )
        }),
        ("Message", {
            "fields": ("subject", "message")
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

    @admin.display(description="Subject")
    def subject_badge(self, obj):
        colours = {
            "general":     "#6CB4E4",
            "support":     "#E09F3E",
            "media":       "#9B59B6",
            "partnership": "#5BA55B",
            "careers":     "#C9A84C",
            "other":       "#888",
        }
        colour = colours.get(obj.subject, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_subject_display()
        )


# ──────────────────────────────────────────────────────────────────────────────
# GROUP CHARTER INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(GroupCharterInquiry)
class GroupCharterInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "contact_name", "email",
        "group_type_badge", "group_size", "route_summary",
        "departure_date", "status_badge", "created_at"
    )
    list_filter = (
        "group_type", "status", "is_round_trip",
        "catering_required", "ground_transport_required",
        ("departure_date", admin.DateFieldListFilter),
    )
    search_fields = ("contact_name", "email", "company", "reference",
                     "origin_description", "destination_description")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Reference", {
            "fields": ("reference", "status")
        }),
        ("Contact", {
            "fields": (
                ("contact_name", "email"),
                ("phone", "company"),
            )
        }),
        ("Group Details", {
            "fields": (
                ("group_type", "group_size"),
            )
        }),
        ("Flight Details", {
            "fields": (
                ("origin_description", "destination_description"),
                ("departure_date", "return_date"),
                "is_round_trip",
                "preferred_aircraft_category",
            )
        }),
        ("Add-ons", {
            "fields": (
                ("catering_required", "ground_transport_required"),
                "budget_range",
            )
        }),
        ("Notes", {
            "fields": ("additional_notes",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Group Type")
    def group_type_badge(self, obj):
        colours = {
            "corporate":     "#6CB4E4",
            "sports_team":   "#5BA55B",
            "entertainment": "#9B59B6",
            "incentive":     "#E09F3E",
            "wedding":       "#E05252",
            "government":    "#C9A84C",
            "other":         "#888",
        }
        colour = colours.get(obj.group_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_group_type_display()
        )

    @admin.display(description="Route")
    def route_summary(self, obj):
        origin = obj.origin_description or "—"
        dest   = obj.destination_description or "—"
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            origin[:20], dest[:20]
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        updated = queryset.update(status="pending")
        self.message_user(request, f"{updated} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status="contacted")
        self.message_user(request, f"{updated} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.update(status="completed")
        self.message_user(request, f"{updated} inquiry(s) marked as Completed.")


# ──────────────────────────────────────────────────────────────────────────────
# AIR CARGO INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(AirCargoInquiry)
class AirCargoInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "contact_name", "email", "company",
        "cargo_type_badge", "route_summary", "urgency_badge",
        "weight_kg", "status_badge", "created_at"
    )
    list_filter = (
        "cargo_type", "urgency", "status",
        "is_hazardous", "requires_temperature_control",
        "insurance_required", "customs_assistance_needed",
        ("pickup_date", admin.DateFieldListFilter),
    )
    search_fields = ("contact_name", "email", "company", "reference",
                     "origin_description", "destination_description", "cargo_description")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Reference", {
            "fields": ("reference", "status")
        }),
        ("Contact", {
            "fields": (
                ("contact_name", "email"),
                ("phone", "company"),
            )
        }),
        ("Cargo Details", {
            "fields": (
                ("cargo_type", "urgency"),
                "cargo_description",
                ("weight_kg", "volume_m3", "dimensions"),
            )
        }),
        ("Route & Timeline", {
            "fields": (
                ("origin_description", "destination_description"),
                "pickup_date",
            )
        }),
        ("Special Handling", {
            "fields": (
                ("is_hazardous", "requires_temperature_control"),
                ("insurance_required", "customs_assistance_needed"),
            )
        }),
        ("Notes", {
            "fields": ("additional_notes",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Cargo Type")
    def cargo_type_badge(self, obj):
        colours = {
            "general":         "#6CB4E4",
            "perishables":     "#5BA55B",
            "pharma":          "#9B59B6",
            "dangerous_goods": "#E05252",
            "live_animals":    "#E09F3E",
            "artwork":         "#C9A84C",
            "automotive":      "#888",
            "oversized":       "#555",
            "humanitarian":    "#50C878",
            "other":           "#aaa",
        }
        colour = colours.get(obj.cargo_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_cargo_type_display()
        )

    @admin.display(description="Route")
    def route_summary(self, obj):
        origin = obj.origin_description or "—"
        dest   = obj.destination_description or "—"
        return format_html(
            '<strong>{}</strong> <span style="color:#C9A84C;">→</span> <strong>{}</strong>',
            origin[:18], dest[:18]
        )

    @admin.display(description="Urgency")
    def urgency_badge(self, obj):
        colours = {
            "standard": "#6CB4E4",
            "express":  "#E09F3E",
            "critical": "#E05252",
        }
        colour = colours.get(obj.urgency, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_urgency_display()
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        updated = queryset.update(status="pending")
        self.message_user(request, f"{updated} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status="contacted")
        self.message_user(request, f"{updated} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.update(status="completed")
        self.message_user(request, f"{updated} inquiry(s) marked as Completed.")


# ──────────────────────────────────────────────────────────────────────────────
# AIRCRAFT SALES INQUIRY
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(AircraftSalesInquiry)
class AircraftSalesInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "short_reference", "contact_name", "email", "company",
        "inquiry_type_badge", "aircraft_summary",
        "budget_range", "status_badge", "created_at"
    )
    list_filter = (
        "inquiry_type", "status", "new_or_pre_owned",
        "preferred_category", "budget_range",
        ("created_at", admin.DateFieldListFilter),
    )
    search_fields = ("contact_name", "email", "company", "reference",
                     "aircraft_make", "aircraft_model", "serial_number")
    ordering = ("-created_at",)
    readonly_fields = ("reference", "created_at")
    list_per_page = 25

    fieldsets = (
        ("Reference", {
            "fields": ("reference", "status")
        }),
        ("Contact", {
            "fields": (
                ("contact_name", "email"),
                ("phone", "company"),
            )
        }),
        ("Inquiry Type", {
            "fields": ("inquiry_type",)
        }),
        ("Buyer Requirements", {
            "fields": (
                ("preferred_category", "preferred_make_model"),
                ("budget_range", "new_or_pre_owned"),
            ),
            "classes": ("collapse",),
        }),
        ("Seller / Trade Details", {
            "fields": (
                ("aircraft_make", "aircraft_model"),
                ("year_of_manufacture", "serial_number"),
                ("total_flight_hours", "asking_price_usd"),
            ),
            "classes": ("collapse",),
        }),
        ("Message", {
            "fields": ("message",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_pending", "mark_contacted", "mark_completed"]

    @admin.display(description="Reference")
    def short_reference(self, obj):
        ref = str(obj.reference)
        return format_html(
            '<span title="{}" style="font-family:monospace;font-size:11px;">{}</span>',
            ref, ref[:8] + "…"
        )

    @admin.display(description="Inquiry Type")
    def inquiry_type_badge(self, obj):
        colours = {
            "buy":       "#50C878",
            "sell":      "#6CB4E4",
            "trade":     "#E09F3E",
            "valuation": "#9B59B6",
        }
        colour = colours.get(obj.inquiry_type, "#888")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.get_inquiry_type_display()
        )

    @admin.display(description="Aircraft")
    def aircraft_summary(self, obj):
        if obj.aircraft_make and obj.aircraft_model:
            year = f" ({obj.year_of_manufacture})" if obj.year_of_manufacture else ""
            return format_html(
                '<strong>{} {}</strong><span style="color:#888;font-size:11px;">{}</span>',
                obj.aircraft_make, obj.aircraft_model, year
            )
        if obj.preferred_make_model:
            return format_html(
                '<span style="color:#888;">Seeking: {}</span>',
                obj.preferred_make_model
            )
        return format_html('<span style="color:#aaa;">—</span>')

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#C9A84C" if obj.status == "pending" else "#50C878"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:600;">{}</span>',
            colour, obj.status.title()
        )

    @admin.action(description="Mark selected as Pending")
    def mark_pending(self, request, queryset):
        updated = queryset.update(status="pending")
        self.message_user(request, f"{updated} inquiry(s) marked as Pending.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status="contacted")
        self.message_user(request, f"{updated} inquiry(s) marked as Contacted.")

    @admin.action(description="Mark selected as Completed")
    def mark_completed(self, request, queryset):
        updated = queryset.update(status="completed")
        self.message_user(request, f"{updated} inquiry(s) marked as Completed.")