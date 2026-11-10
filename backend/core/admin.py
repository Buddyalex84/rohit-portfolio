from django.contrib import admin

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {"fields": ("name", "tagline")}),
        (
            "Contact",
            {"fields": ("phone", "whatsapp", "email", "address", "hours", "map_embed_url")},
        ),
        ("Social", {"fields": ("instagram_url", "facebook_url")}),
        ("Uploads", {"fields": ("max_upload_mb",)}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
