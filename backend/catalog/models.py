from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ImageSourceMixin(models.Model):
    image = models.ImageField(upload_to="catalog/", blank=True)
    image_url = models.URLField(blank=True, help_text="Optional remote image used when no file is uploaded.")

    class Meta:
        abstract = True

    @property
    def display_image(self) -> str:
        if self.image:
            return self.image.url
        return self.image_url


class Category(ImageSourceMixin, TimeStampedModel):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    supports_suit_types = models.BooleanField(default=False)
    customization_groups = models.JSONField(
        default=list,
        blank=True,
        help_text="Ordered option groups shown for this garment, e.g. ['fit','collar','cuff'].",
    )

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class SuitType(ImageSourceMixin, TimeStampedModel):
    category = models.ForeignKey(Category, related_name="suit_types", on_delete=models.CASCADE)
    slug = models.SlugField()
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    includes_trousers = models.BooleanField(default=False)
    includes_waistcoat = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ("category", "slug")

    def __str__(self) -> str:
        return self.name


class Fabric(ImageSourceMixin, TimeStampedModel):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    texture_note = models.CharField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ColorOption(TimeStampedModel):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    hex_value = models.CharField(max_length=7)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Product(ImageSourceMixin, TimeStampedModel):
    category = models.ForeignKey(Category, related_name="products", on_delete=models.CASCADE)
    suit_type = models.ForeignKey(
        SuitType, related_name="products", on_delete=models.SET_NULL, null=True, blank=True
    )
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=160)
    garment_type = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quote_only = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    fabrics = models.ManyToManyField(Fabric, blank=True, related_name="products")
    colors = models.ManyToManyField(ColorOption, blank=True, related_name="products")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name

    @property
    def price_label(self) -> str:
        if self.quote_only or self.starting_price is None:
            return "Price on consultation"
        return f"From ₹{self.starting_price:.0f}"


class ProductImage(ImageSourceMixin, TimeStampedModel):
    product = models.ForeignKey(Product, related_name="gallery", on_delete=models.CASCADE)
    alt_text = models.CharField(max_length=160, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class CustomizationOption(ImageSourceMixin, TimeStampedModel):
    FIT = "fit"
    COLLAR = "collar"
    CUFF = "cuff"
    LAPEL = "lapel"
    NECKLINE = "neckline"
    SLEEVE = "sleeve"
    LENGTH = "length"
    POCKET = "pocket"
    CLOSURE = "closure"
    LINING = "lining"
    BUTTON = "button"
    PATTERN = "pattern"
    GROUP_CHOICES = [
        (FIT, "Fit"),
        (COLLAR, "Collar"),
        (CUFF, "Cuff"),
        (LAPEL, "Lapel"),
        (NECKLINE, "Neckline"),
        (SLEEVE, "Sleeve"),
        (LENGTH, "Length"),
        (POCKET, "Pocket"),
        (CLOSURE, "Closure"),
        (LINING, "Lining"),
        (BUTTON, "Button"),
        (PATTERN, "Pattern"),
    ]

    category = models.ForeignKey(Category, related_name="options", on_delete=models.CASCADE)
    group = models.CharField(max_length=32, choices=GROUP_CHOICES)
    slug = models.SlugField()
    name = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    is_preference_prompt = models.BooleanField(
        default=False, help_text="Opens notes + reference upload instead of a fixed style."
    )
    viewer_variant = models.CharField(
        max_length=64,
        blank=True,
        help_text="Key understood by the 3D viewer, e.g. spread, french, peak.",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["group", "sort_order", "name"]
        unique_together = ("category", "group", "slug")

    def __str__(self) -> str:
        return f"{self.category.name} · {self.get_group_display()} · {self.name}"


class MeasurementField(TimeStampedModel):
    category = models.ForeignKey(Category, related_name="measurement_fields", on_delete=models.CASCADE)
    key = models.SlugField()
    label = models.CharField(max_length=120)
    instruction = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    min_cm = models.DecimalField(max_digits=6, decimal_places=1, default=10)
    max_cm = models.DecimalField(max_digits=6, decimal_places=1, default=200)

    class Meta:
        ordering = ["sort_order", "id"]
        unique_together = ("category", "key")

    def __str__(self) -> str:
        return f"{self.category.name} · {self.label}"


class StandardSize(TimeStampedModel):
    category = models.ForeignKey(Category, related_name="sizes", on_delete=models.CASCADE)
    code = models.CharField(max_length=16)
    label = models.CharField(max_length=40, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "code"]
        unique_together = ("category", "code")

    def __str__(self) -> str:
        return f"{self.category.name} · {self.code}"


class GarmentModel3D(TimeStampedModel):
    category = models.ForeignKey(Category, related_name="models_3d", on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, related_name="models_3d", on_delete=models.SET_NULL, null=True, blank=True
    )
    name = models.CharField(max_length=120)
    glb_file = models.FileField(upload_to="models/", blank=True)
    glb_url = models.URLField(blank=True)
    procedural_preset = models.CharField(
        max_length=32,
        default="shirt",
        help_text="Fallback procedural mesh: shirt, pants, kurta, pathani, waistcoat, sherwani, blazer.",
    )
    supported_options = models.JSONField(
        default=dict,
        blank=True,
        help_text='Example: {"color": true, "collar": true, "cuff": true, "fit": false}',
    )
    material_slots = models.JSONField(default=dict, blank=True)
    fallback_note = models.CharField(max_length=240, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "3D garment model"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def model_src(self) -> str:
        if self.glb_file:
            return self.glb_file.url
        return self.glb_url
