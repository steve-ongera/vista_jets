from rest_framework import serializers
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg, YachtCharter,
    LeaseInquiry, FlightInquiry
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