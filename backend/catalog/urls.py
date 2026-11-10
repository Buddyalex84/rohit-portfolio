from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ColorViewSet,
    CustomizationOptionViewSet,
    FabricViewSet,
    GarmentModelViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("fabrics", FabricViewSet, basename="fabric")
router.register("colors", ColorViewSet, basename="color")
router.register("customization-options", CustomizationOptionViewSet, basename="customization-option")
router.register("garment-models", GarmentModelViewSet, basename="garment-model")

urlpatterns = router.urls
