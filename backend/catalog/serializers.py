from rest_framework import serializers

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


class ImageMixin(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        value = obj.display_image
        if not value:
            return ""
        if value.startswith("http"):
            return value
        if request:
            return request.build_absolute_uri(value)
        return value


class ColorOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorOption
        fields = ("id", "slug", "name", "hex_value")


class FabricSerializer(ImageMixin):
    class Meta:
        model = Fabric
        fields = ("id", "slug", "name", "description", "texture_note", "image")


class SuitTypeSerializer(ImageMixin):
    class Meta:
        model = SuitType
        fields = (
            "id",
            "slug",
            "name",
            "description",
            "includes_trousers",
            "includes_waistcoat",
            "image",
            "sort_order",
        )


class ProductImageSerializer(ImageMixin):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order")


class ProductListSerializer(ImageMixin):
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    suit_type = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    price_label = serializers.CharField(read_only=True)
    colors = ColorOptionSerializer(many=True, read_only=True)
    fabrics = FabricSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "name",
            "garment_type",
            "description",
            "image",
            "category",
            "suit_type",
            "starting_price",
            "quote_only",
            "price_label",
            "colors",
            "fabrics",
        )


class ProductDetailSerializer(ProductListSerializer):
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("gallery",)


class CustomizationOptionSerializer(ImageMixin):
    class Meta:
        model = CustomizationOption
        fields = (
            "id",
            "group",
            "slug",
            "name",
            "description",
            "image",
            "is_preference_prompt",
            "viewer_variant",
            "sort_order",
        )


class MeasurementFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementField
        fields = ("id", "key", "label", "instruction", "min_cm", "max_cm", "sort_order")


class StandardSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardSize
        fields = ("id", "code", "label", "sort_order")


class GarmentModel3DSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")

    class Meta:
        model = GarmentModel3D
        fields = (
            "id",
            "name",
            "category",
            "src",
            "procedural_preset",
            "supported_options",
            "material_slots",
            "fallback_note",
        )

    def get_src(self, obj):
        request = self.context.get("request")
        value = obj.model_src
        if not value:
            return ""
        if value.startswith("http"):
            return value
        if request:
            return request.build_absolute_uri(value)
        return value


class CategorySerializer(ImageMixin):
    suit_types = SuitTypeSerializer(many=True, read_only=True)
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "slug",
            "name",
            "tagline",
            "description",
            "image",
            "sort_order",
            "supports_suit_types",
            "customization_groups",
            "suit_types",
            "product_count",
        )


class CategoryDetailSerializer(CategorySerializer):
    options = CustomizationOptionSerializer(many=True, read_only=True)
    measurement_fields = MeasurementFieldSerializer(many=True, read_only=True)
    sizes = StandardSizeSerializer(many=True, read_only=True)
    models_3d = GarmentModel3DSerializer(many=True, read_only=True)

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + (
            "options",
            "measurement_fields",
            "sizes",
            "models_3d",
        )
