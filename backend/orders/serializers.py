from django.db import transaction
from rest_framework import serializers

from catalog.models import Category, CustomizationOption, Product, SuitType
from core.models import SiteSettings

from .emails import notify_staff_request
from .models import (
    ConsultationAppointment,
    CustomizationSelection,
    Customer,
    Measurement,
    ReferenceImage,
    TailoringRequest,
    TailoringRequestItem,
)
from .uploads import validate_image_file
from .validation import validate_customization_payload, validate_item, validate_measurements


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationAppointment
        fields = (
            "id",
            "full_name",
            "phone",
            "preferred_date",
            "preferred_time_slot",
            "location",
            "instructions",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "status", "created_at")

    def create(self, validated_data):
        appointment = ConsultationAppointment.objects.create(**validated_data)
        notify_staff_request(
            "CONSULT",
            f"Consultation requested by {appointment.full_name} on {appointment.preferred_date}. "
            "Availability must be confirmed before treating this as a booking.",
        )
        return appointment


class TailoringRequestCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=160)
    phone = serializers.CharField(max_length=32)
    email = serializers.EmailField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=120, required=False, allow_blank=True)
    preferred_contact_method = serializers.ChoiceField(
        choices=["phone", "whatsapp", "email"], default="whatsapp"
    )
    address = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    garment_dropoff_notes = serializers.CharField(required=False, allow_blank=True)
    preferred_consultation_date = serializers.DateField(required=False, allow_null=True)
    preferred_time_slot = serializers.CharField(required=False, allow_blank=True)
    category_slug = serializers.SlugField()
    product_slug = serializers.SlugField(required=False, allow_blank=True)
    suit_type_slug = serializers.SlugField(required=False, allow_blank=True)
    measurement_method = serializers.ChoiceField(choices=["provide_garment", "consultant"])
    size_mode = serializers.ChoiceField(choices=["standard", "custom"])
    size_code = serializers.CharField(required=False, allow_blank=True)
    unit = serializers.ChoiceField(choices=["cm", "in"], default="cm")
    fabric_slug = serializers.SlugField(required=False, allow_blank=True)
    color_slug = serializers.SlugField(required=False, allow_blank=True)
    selections = serializers.ListField(child=serializers.DictField(), required=False)
    measurements = serializers.ListField(child=serializers.DictField(), required=False)
    consultation = serializers.DictField(required=False)

    def validate(self, attrs):
        try:
            category = Category.objects.get(slug=attrs["category_slug"], is_active=True)
        except Category.DoesNotExist:
            raise serializers.ValidationError({"category_slug": "Unknown garment category."})

        product = None
        if attrs.get("product_slug"):
            try:
                product = Product.objects.get(slug=attrs["product_slug"], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError({"product_slug": "Unknown product."})

        suit_type = None
        if attrs.get("suit_type_slug"):
            try:
                suit_type = SuitType.objects.get(
                    slug=attrs["suit_type_slug"], category=category, is_active=True
                )
            except SuitType.DoesNotExist:
                raise serializers.ValidationError({"suit_type_slug": "Unknown suit type."})

        errors = validate_item(category, product, suit_type)
        errors += validate_customization_payload(category, attrs.get("selections") or [])
        if attrs["size_mode"] == "custom" or attrs["measurement_method"] != "consultant":
            if attrs["size_mode"] == "custom":
                errors += validate_measurements(
                    category,
                    attrs["size_mode"],
                    attrs.get("size_code") or "",
                    attrs.get("measurements") or [],
                    attrs.get("unit") or "cm",
                )
            elif attrs["size_mode"] == "standard":
                errors += validate_measurements(
                    category,
                    attrs["size_mode"],
                    attrs.get("size_code") or "",
                    [],
                    attrs.get("unit") or "cm",
                )

        if attrs["measurement_method"] == "consultant":
            consultation = attrs.get("consultation") or {}
            required = ["full_name", "phone", "preferred_date", "preferred_time_slot", "location"]
            for field in required:
                if not consultation.get(field):
                    errors.append("Consultation requests need name, phone, date, time, and location.")
                    break
        if attrs["measurement_method"] == "provide_garment" and not attrs.get("garment_dropoff_notes"):
            errors.append("Please describe how the fitting garment will be delivered or dropped off.")

        if errors:
            raise serializers.ValidationError({"compatibility": errors})

        attrs["category"] = category
        attrs["product"] = product
        attrs["suit_type"] = suit_type
        return attrs

    @transaction.atomic
    def create(self, validated):
        customer = Customer.objects.create(
            full_name=validated["full_name"],
            phone=validated["phone"],
            email=validated.get("email") or "",
            city=validated.get("city") or "",
            preferred_contact_method=validated.get("preferred_contact_method") or "whatsapp",
        )
        request_obj = TailoringRequest.objects.create(
            customer=customer,
            measurement_method=validated["measurement_method"],
            size_mode=validated["size_mode"],
            size_code=validated.get("size_code") or "",
            unit=validated.get("unit") or "cm",
            notes=validated.get("notes") or "",
            garment_dropoff_notes=validated.get("garment_dropoff_notes") or "",
            address=validated.get("address") or "",
            preferred_consultation_date=validated.get("preferred_consultation_date"),
            preferred_time_slot=validated.get("preferred_time_slot") or "",
        )
        item = TailoringRequestItem.objects.create(
            request=request_obj,
            category=validated["category"],
            product=validated["product"],
            suit_type=validated["suit_type"],
        )
        extra_notes = []
        if validated.get("fabric_slug"):
            extra_notes.append(f"Fabric: {validated['fabric_slug']}")
        if validated.get("color_slug"):
            extra_notes.append(f"Color: {validated['color_slug']}")
        if extra_notes:
            item.notes = " · ".join(extra_notes)
            item.save(update_fields=["notes"])

        for selection in validated.get("selections") or []:
            option = None
            if selection.get("option_id"):
                option = CustomizationOption.objects.filter(pk=selection["option_id"]).first()
            CustomizationSelection.objects.create(
                item=item,
                option=option,
                group=selection.get("group") or "",
                value_text=selection.get("value_text") or "",
            )

        for measurement in validated.get("measurements") or []:
            Measurement.objects.create(
                request=request_obj,
                field_key=measurement["field_key"],
                label=measurement.get("label") or measurement["field_key"],
                value=measurement["value"],
                unit=validated.get("unit") or "cm",
            )

        consultation = validated.get("consultation")
        if consultation and validated["measurement_method"] == "consultant":
            ConsultationAppointment.objects.create(
                request=request_obj,
                full_name=consultation["full_name"],
                phone=consultation["phone"],
                preferred_date=consultation["preferred_date"],
                preferred_time_slot=consultation["preferred_time_slot"],
                location=consultation["location"],
                instructions=consultation.get("instructions") or "",
            )

        notify_staff_request(
            request_obj.reference,
            f"New tailoring inquiry {request_obj.reference} from {customer.full_name} "
            f"for {validated['category'].name}. This is a quote request until confirmed.",
        )
        return request_obj


class TailoringRequestReadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name")
    items = serializers.SerializerMethodField()
    email_sent = serializers.SerializerMethodField()

    class Meta:
        model = TailoringRequest
        fields = (
            "reference",
            "status",
            "customer_name",
            "measurement_method",
            "size_mode",
            "size_code",
            "unit",
            "created_at",
            "items",
            "email_sent",
        )

    def get_items(self, obj):
        return [
            {
                "category": item.category.slug,
                "product": item.product.slug if item.product else None,
                "suit_type": item.suit_type.slug if item.suit_type else None,
            }
            for item in obj.items.all()
        ]

    def get_email_sent(self, obj):
        from django.conf import settings

        return bool(settings.EMAIL_CONFIGURED)


class ReferenceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceImage
        fields = ("id", "field_key", "image", "notes", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_image(self, value):
        validate_image_file(value)
        return value

    def validate(self, attrs):
        request_ref = self.context["request"].data.get("reference")
        if not request_ref:
            raise serializers.ValidationError({"reference": "Order reference is required."})
        try:
            tailoring_request = TailoringRequest.objects.get(reference=request_ref)
        except TailoringRequest.DoesNotExist:
            raise serializers.ValidationError({"reference": "Unknown tailoring request."})
        attrs["request"] = tailoring_request
        return attrs

    def create(self, validated):
        return ReferenceImage.objects.create(**validated)
