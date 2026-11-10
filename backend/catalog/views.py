from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import (
    Category,
    ColorOption,
    CustomizationOption,
    Fabric,
    GarmentModel3D,
    Product,
)
from .serializers import (
    CategoryDetailSerializer,
    CategorySerializer,
    ColorOptionSerializer,
    CustomizationOptionSerializer,
    FabricSerializer,
    GarmentModel3DSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class PublicReadAdminWrite(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]


class CategoryViewSet(PublicReadAdminWrite):
    lookup_field = "slug"
    filterset_fields = ("is_active",)

    def get_queryset(self):
        qs = (
            Category.objects.filter(is_active=True)
            .prefetch_related("suit_types")
            .annotate(product_count=Count("products", filter=Q(products__is_active=True)))
        )
        if self.action == "retrieve":
            qs = qs.prefetch_related(
                "options",
                "measurement_fields",
                "sizes",
                "models_3d",
            )
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CategoryDetailSerializer
        return CategorySerializer


class ProductViewSet(PublicReadAdminWrite):
    lookup_field = "slug"
    filterset_fields = ("category__slug", "suit_type__slug", "is_active")
    search_fields = ("name", "garment_type", "description")

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category", "suit_type")
            .prefetch_related("colors", "fabrics", "gallery")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer


class FabricViewSet(PublicReadAdminWrite):
    queryset = Fabric.objects.filter(is_active=True)
    serializer_class = FabricSerializer


class ColorViewSet(PublicReadAdminWrite):
    queryset = ColorOption.objects.filter(is_active=True)
    serializer_class = ColorOptionSerializer


class CustomizationOptionViewSet(PublicReadAdminWrite):
    serializer_class = CustomizationOptionSerializer
    filterset_fields = ("category__slug", "group")

    def get_queryset(self):
        return CustomizationOption.objects.filter(is_active=True).select_related("category")


class GarmentModelViewSet(PublicReadAdminWrite):
    serializer_class = GarmentModel3DSerializer
    filterset_fields = ("category__slug",)

    def get_queryset(self):
        return GarmentModel3D.objects.filter(is_active=True).select_related("category", "product")
