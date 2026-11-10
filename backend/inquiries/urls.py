from django.urls import path

from .views import ContactInquiryView

urlpatterns = [
    path("contact-inquiries/", ContactInquiryView.as_view(), name="contact-inquiries"),
]
