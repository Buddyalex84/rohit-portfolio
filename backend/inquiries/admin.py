from django.contrib import admin

from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "subject", "handled", "created_at")
    list_filter = ("handled",)
    search_fields = ("full_name", "phone", "email", "subject")
    readonly_fields = ("ip_address", "created_at")
