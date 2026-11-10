from rest_framework import serializers

from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    email_configured = serializers.SerializerMethodField()
    contact_configured = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = (
            "name",
            "tagline",
            "phone",
            "whatsapp",
            "email",
            "address",
            "hours",
            "map_embed_url",
            "instagram_url",
            "facebook_url",
            "max_upload_mb",
            "email_configured",
            "contact_configured",
        )

    def get_email_configured(self, obj):
        from django.conf import settings

        return bool(settings.EMAIL_CONFIGURED and (obj.email or settings.STAFF_NOTIFY_EMAIL))

    def get_contact_configured(self, obj):
        return bool(obj.phone or obj.whatsapp or obj.email)
