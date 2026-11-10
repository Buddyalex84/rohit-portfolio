from django.contrib import admin

from .models import (
    Category,
    ColorOption,
    CustomizationOption,
    Fabric,
    GarmentModel3D,
    MeasurementField,
    Product,
    ProductImage,
    StandardSize,
    SuitType,
)


class SuitTypeInline(admin.TabularInline):
    model = SuitType
    extra = 0


class MeasurementFieldInline(admin.TabularInline):
    model = MeasurementField
    extra = 0


class StandardSizeInline(admin.TabularInline):
    model = StandardSize
    extra = 0


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order", "is_active", "supports_suit_types")
    list_filter = ("is_active", "supports_suit_types")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [SuitTypeInline, MeasurementFieldInline, StandardSizeInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "suit_type", "quote_only", "starting_price", "is_active")
    list_filter = ("category", "suit_type", "is_active", "quote_only")
    search_fields = ("name", "slug")
    filter_horizontal = ("fabrics", "colors")
    inlines = [ProductImageInline]


@admin.register(Fabric)
class FabricAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ColorOption)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "hex_value", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(CustomizationOption)
class CustomizationOptionAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "group", "is_preference_prompt", "is_active", "sort_order")
    list_filter = ("category", "group", "is_active")
    search_fields = ("name", "slug")


@admin.register(GarmentModel3D)
class GarmentModel3DAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "procedural_preset", "is_active")
    list_filter = ("category", "is_active")
