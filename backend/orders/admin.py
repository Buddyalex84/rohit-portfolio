from django.contrib import admin

from .models import (
    ConsultationAppointment,
    CustomizationSelection,
    Customer,
    Measurement,
    ReferenceImage,
    TailoringRequest,
    TailoringRequestItem,
)


class SelectionInline(admin.TabularInline):
    model = CustomizationSelection
    extra = 0


class ItemInline(admin.StackedInline):
    model = TailoringRequestItem
    extra = 0


class MeasurementInline(admin.TabularInline):
    model = Measurement
    extra = 0


class ReferenceInline(admin.TabularInline):
    model = ReferenceImage
    extra = 0


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "email", "city")
    search_fields = ("full_name", "phone", "email")


@admin.register(TailoringRequest)
class TailoringRequestAdmin(admin.ModelAdmin):
    list_display = ("reference", "customer", "status", "measurement_method", "created_at")
    list_filter = ("status", "measurement_method")
    search_fields = ("reference", "customer__full_name", "customer__phone")
    inlines = [ItemInline, MeasurementInline, ReferenceInline]
    readonly_fields = ("reference", "created_at", "updated_at")


@admin.register(TailoringRequestItem)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("request", "category", "product", "suit_type")
    inlines = [SelectionInline]


@admin.register(ConsultationAppointment)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "preferred_date", "status")
    list_filter = ("status",)
