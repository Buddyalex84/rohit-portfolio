from django.db import models


class SiteSettings(models.Model):
    """Singleton business details. Leave fields blank rather than inventing them."""

    name = models.CharField(max_length=80, default="Darjee")
    tagline = models.CharField(max_length=160, blank=True, default="Tailored to Perfection")
    phone = models.CharField(max_length=32, blank=True)
    whatsapp = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    hours = models.CharField(max_length=200, blank=True)
    map_embed_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    max_upload_mb = models.PositiveIntegerField(default=8)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
