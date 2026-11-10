import uuid
from datetime import date

from django.core.exceptions import ValidationError
from django.db import models

from catalog.models import Category, CustomizationOption, Product, SuitType


def request_reference() -> str:
    return f"DJ-{date.today().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class Customer(models.Model):
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[("phone", "Phone"), ("whatsapp", "WhatsApp"), ("email", "Email")],
        default="whatsapp",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.full_name} ({self.phone})"


class TailoringRequest(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New Request"
        CONTACTED = "contacted", "Contacted"
        CONSULTATION = "consultation_scheduled", "Consultation Scheduled"
        MEASUREMENTS = "measurements_received", "Measurements Received"
        QUOTE = "quote_sent", "Quote Sent"
        APPROVED = "approved", "Approved"
        PRODUCTION = "in_production", "In Production"
        FITTING = "ready_for_fitting", "Ready for Fitting"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class MeasurementMethod(models.TextChoices):
        PROVIDE_GARMENT = "provide_garment", "Provide your garment"
        CONSULTANT = "consultant", "Consultant takes measurements"

    class SizeMode(models.TextChoices):
        STANDARD = "standard", "Standard size"
        CUSTOM = "custom", "Custom measurements"

    reference = models.CharField(max_length=24, unique=True, default=request_reference, editable=False)
    customer = models.ForeignKey(Customer, related_name="requests", on_delete=models.PROTECT)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.NEW)
    measurement_method = models.CharField(max_length=32, choices=MeasurementMethod.choices)
    size_mode = models.CharField(max_length=16, choices=SizeMode.choices)
    size_code = models.CharField(max_length=16, blank=True)
    unit = models.CharField(max_length=8, choices=[("cm", "cm"), ("in", "in")], default="cm")
    notes = models.TextField(blank=True)
    garment_dropoff_notes = models.TextField(blank=True)
    address = models.TextField(blank=True)
    preferred_consultation_date = models.DateField(null=True, blank=True)
    preferred_time_slot = models.CharField(max_length=40, blank=True)
    internal_notes = models.TextField(blank=True)
    consultation_date = models.DateField(null=True, blank=True)
    price_estimate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.reference


class TailoringRequestItem(models.Model):
    request = models.ForeignKey(TailoringRequest, related_name="items", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    suit_type = models.ForeignKey(SuitType, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)

    def clean(self):
        if self.suit_type and self.suit_type.category_id != self.category_id:
            raise ValidationError("Suit type does not belong to the selected category.")
        if self.product and self.product.category_id != self.category_id:
            raise ValidationError("Product does not belong to the selected category.")
        if self.category.supports_suit_types and not self.suit_type_id:
            raise ValidationError("A suit type is required for this garment.")
        if self.suit_type and not self.category.supports_suit_types:
            raise ValidationError("Suit types are not available for this garment.")

    def __str__(self) -> str:
        return f"{self.request.reference} · {self.category.name}"


class CustomizationSelection(models.Model):
    item = models.ForeignKey(TailoringRequestItem, related_name="selections", on_delete=models.CASCADE)
    option = models.ForeignKey(
        CustomizationOption, on_delete=models.SET_NULL, null=True, blank=True
    )
    group = models.CharField(max_length=32)
    value_text = models.TextField(blank=True)

    def clean(self):
        if self.option and self.option.category_id != self.item.category_id:
            raise ValidationError("Customization option is not valid for this garment.")
        if self.option and self.option.group != self.group:
            raise ValidationError("Option group mismatch.")


class Measurement(models.Model):
    request = models.ForeignKey(TailoringRequest, related_name="measurements", on_delete=models.CASCADE)
    field_key = models.SlugField()
    label = models.CharField(max_length=120)
    value = models.DecimalField(max_digits=6, decimal_places=1)
    unit = models.CharField(max_length=8)


class ReferenceImage(models.Model):
    request = models.ForeignKey(TailoringRequest, related_name="reference_images", on_delete=models.CASCADE)
    field_key = models.SlugField()
    image = models.ImageField(upload_to="references/%Y/%m/")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ConsultationAppointment(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"

    request = models.ForeignKey(
        TailoringRequest, related_name="consultations", on_delete=models.SET_NULL, null=True, blank=True
    )
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32)
    preferred_date = models.DateField()
    preferred_time_slot = models.CharField(max_length=40)
    location = models.CharField(max_length=240)
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    staff_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} · {self.preferred_date} ({self.status})"
